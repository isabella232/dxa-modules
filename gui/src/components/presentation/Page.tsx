import { Html } from "utils/Html";
import { Url } from "utils/Url";
import { ContentNavigation, IContentNavigationItem } from "components/presentation/ContentNavigation";

import "components/presentation/styles/Page";
import "dist/dita-ot/styles/commonltr";
import "dist/dita-ot/styles/commonrtl";

// Global Catalina dependencies
import ActivityIndicator = SDL.ReactComponents.ActivityIndicator;
import ValidationMessage = SDL.ReactComponents.ValidationMessage;

/**
 * Page component props
 *
 * @export
 * @interface IPageProps
 */
export interface IPageProps {
    /**
     * Show activity indicator
     *
     * @type {boolean}
     */
    showActivityIndicator: boolean;
    /**
     * Show fixed navigation panels
     *
     * @type {boolean}
     */
    isNavFixed?: boolean;
    /**
     * Page content
     *
     * @type {string | null}
     */
    content?: string | null;
    /**
     * An error prevented the page from rendering
     *
     * @type {string | null}
     */
    error?: string | null;
    /**
     * Current location
     *
     * @type {Location}
     * @memberOf IPublicationContentProps
     */
    location?: Location;
    /**
     * Called whenever navigation to another page is requested
     *
     * @param {string} url Url
     *
     * @memberOf IPageProps
     */
    onNavigate(url: string): void;
}

/**
 * Page component state
 *
 * @export
 * @interface IPageState
 */
export interface IPageState {
    /**
     * Items used in content Navigation
     *
     * @type {IContentNavigationItem[]}
     */
    navItems: IContentNavigationItem[];
}

/**
 * Page component
 */
export class Page extends React.Component<IPageProps, IPageState> {

    private _hyperlinks: { element: HTMLElement, handler: (e: Event) => void; }[] = [];

    /**
     * Creates an instance of Toc.
     *
     */
    constructor() {
        super();
        this.state = {
            navItems: []
        };
    }

    /**
     * Render the component
     *
     * @returns {JSX.Element}
     *
     * @memberOf Page
     */
    public render(): JSX.Element {
        const props = this.props;
        const { navItems } = this.state;
        return (
            <div className={"sdl-dita-delivery-page" + (props.isNavFixed ? " sdl-dita-delivery-fixed-nav" : "")}>
                {props.showActivityIndicator ? <ActivityIndicator /> : null}
                {props.error ? <ValidationMessage messageType={SDL.UI.Controls.ValidationMessageType.Error} message={props.error} /> : null}
                {props.children}
                <ContentNavigation navItems={navItems} />
                <article>
                    <article className={"page-content ltr"} dangerouslySetInnerHTML={{ __html: props.content || "" }} />
                </article>
            </div>
        );
    }

    /**
     * Invoked once, only on the client (not on the server), immediately after the initial rendering occurs.
     */
    public componentDidMount(): void {
        this._enableHyperlinks();
        this._colectHeadersLinks();
    }

    /**
     * Invoked immediately after the component's updates are flushed to the DOM. This method is not called for the initial render.
     *
     * @memberOf Page
     */
    public componentDidUpdate(): void {
        this._enableHyperlinks();
        this._colectHeadersLinks();
    }

    /**
     * Component will unmount
     */
    public componentWillUnmount(): void {
        this._disableHyperlinks();
    }

    /**
     * Make hyperlinks navigate when clicked
     *
     * @private
     *
     * @memberOf Page
     */
    private _enableHyperlinks(): void {
        const props = this.props;
        const domNode = ReactDOM.findDOMNode(this);
        if (domNode) {
            const anchors = domNode.querySelectorAll(".page-content a");
            const hyperlinks = this._hyperlinks;
            for (let i: number = 0, length: number = anchors.length; i < length; i++) {
                const anchor = anchors.item(i) as HTMLAnchorElement;
                const alreadyAdded = hyperlinks.filter(hyperlink => hyperlink.element === anchor).length === 1;
                if (!alreadyAdded) {
                    const itemUrl = anchor.getAttribute("href");
                    if (Url.itemUrlIsValid(itemUrl)) {
                        const onClick = (e: Event): void => {
                            if (itemUrl) {
                                props.onNavigate(itemUrl);
                            }
                            e.preventDefault();
                        };
                        hyperlinks.push({
                            element: anchor,
                            handler: onClick
                        });
                        anchor.addEventListener("click", onClick);
                    }
                }
            }
        }
    }

    /**
     * Collects headers links
     *
     * @private
     *
     * @memberOf Page
     */
    private _colectHeadersLinks(): void {
        const domNode = ReactDOM.findDOMNode(this);
        if (domNode) {
            const { navItems } = this.state;
            const { location } = this.props;
            const pageContentNode = domNode.querySelector(".page-content") as HTMLElement;
            const headerLinks = Html.getHeaderLinks(pageContentNode);
            const updatedNavItems: IContentNavigationItem[] = headerLinks.map(item => {
                return {
                    title: item.title,
                    url: location ? Url.getAnchorUrl(location.pathname, item.id) : ("#" + item.id)
                };
            });

            if (navItems.map((i) => i.url).join("") !== updatedNavItems.map((i) => i.url).join("")) {
                this.setState({
                    navItems: updatedNavItems
                });
            }
        }
    }

    /**
     * Make hyperlinks navigation disabled
     *
     * @private
     *
     * @memberOf Page
     */
    private _disableHyperlinks(): void {
        this._hyperlinks.forEach(anchor => {
            anchor.element.removeEventListener("click", anchor.handler);
        });
    }
}
