import * as React from "react";
import * as ReactDOM from "react-dom";
import { Promise } from "es6-promise";
import { ITaxonomy } from "interfaces/Taxonomy";
import { IPage } from "interfaces/Page";

import { IAppContext } from "components/container/App";
import { NavigationMenu } from "components/presentation/NavigationMenu";
import { Toc } from "components/presentation/Toc";
import { Page } from "components/presentation/Page";
import { Breadcrumbs } from "components/presentation/Breadcrumbs";

import { Html, IHeader } from "utils/Html";
import { TcmId } from "utils/TcmId";
import { Url } from "utils/Url";
import { debounce } from "utils/Function";

import "components/container/styles/PublicationContent";

const FIXED_NAV_CLASS = "fixed-nav";
/**
 * Sum of top and bottom margin of a panel
 */
const PANEL_MARGIN = 64;

/**
 * PublicationContent component props params
 *
 * @export
 * @interface IPublicationContentPropsParams
 */
export interface IPublicationContentPropsParams {
    /**
     * Id of the current publication
     *
     * @type {string}
     */
    publicationId: string;

    /**
     * The page id or the title of the current publication
     *
     * @type {string}
     */
    pageIdOrPublicationTitle?: string;

    /**
     * Title of the current publication
     *
     * @type {string}
     */
    publicationTitle?: string;

    /**
     * Title of the current page
     *
     * @type {string}
     */
    pageTitle?: string;

    /**
     * Anchor within the current page
     *
     * @type {string}
     */
    pageAnchor?: string;
}

/**
 * PublicationContent component props
 *
 * @export
 * @interface IPublicationContentProps
 */
export interface IPublicationContentProps {
    /**
     * Publication content props parameters
     *
     * @type {IPublicationContentPropsParams}
     */
    params: IPublicationContentPropsParams;
}

/**
 * PublicationContent component state
 *
 * @export
 * @interface IPublicationContentState
 */
export interface IPublicationContentState {
    /**
     * Toc is loading
     *
     * @type {boolean}
     */
    isTocLoading?: boolean;
    /**
     * Current selected item in the TOC
     *
     * @type {ITaxonomy | null}
     */
    selectedTocItem?: ITaxonomy | null;
    /**
     * Page is loading
     *
     * @type {boolean}
     */
    isPageLoading?: boolean;
    /**
     * Current active item path in the TOC
     *
     * @type {string[]}
     */
    activeTocItemPath?: string[];
    /**
     * Title of the current publication
     *
     * @type {string}
     */
    publicationTitle?: string;
    /**
     * Active header inside the page
     *
     * @type {IHeader}
     * @memberOf IPublicationContentState
     */
    activePageHeader?: IHeader;
}

interface ISelectedPage {
    /**
     * Content of the current selected page
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
}

interface IToc {
    /**
     * An error prevented the toc from rendering
     *
     * @type {string}
     */
    error?: string;
    /**
     * Root items
     *
     * @type {ITaxonomy[]}
     */
    rootItems?: ITaxonomy[];
}

/**
 * Publication + content component
 */
export class PublicationContent extends React.Component<IPublicationContentProps, IPublicationContentState> {

    public static contextTypes: React.ValidationMap<IAppContext> = {
        services: React.PropTypes.object.isRequired,
        router: React.PropTypes.object.isRequired
    };

    public context: IAppContext;
    private _page: ISelectedPage = {};
    private _toc: IToc = {};
    private _isUnmounted: boolean = false;
    private _topOffset: number = 0;

    /**
     * Creates an instance of App.
     *
     */
    constructor() {
        super();
        this.state = {
            isTocLoading: true,
            selectedTocItem: null,
            isPageLoading: true
        };
    }

    /**
     * Invoked once, both on the client and server, immediately before the initial rendering occurs.
     */
    public componentWillMount(): void {
        const { publicationId, pageIdOrPublicationTitle} = this.props.params;
        const pageId = TcmId.isValidPageId(pageIdOrPublicationTitle) ? pageIdOrPublicationTitle : null;
        const { publicationService, pageService } = this.context.services;

        if (pageId) {
            // Load the page
            pageService.getPageInfo(publicationId, pageId).then(
                this._onPageContentRetrieved.bind(this),
                this._onPageContentRetrievFailed.bind(this));
        } else {
            this._loadTocRootItems(publicationId);
        }

        // Get publication title
        publicationService.getPublicationTitle(publicationId).then(
            title => {
                /* istanbul ignore else */
                if (!this._isUnmounted) {
                    this.setState({
                        publicationTitle: title
                    });
                }
            },
            error => {
                /* istanbul ignore else */
                if (!this._isUnmounted) {
                    // TODO: improve error handling
                    this.setState({
                        publicationTitle: error
                    });
                }
            });
    }

    /**
     * Invoked when a component is receiving new props. This method is not called for the initial render.
     *
     * @param {IPublicationContentProps} nextProps
     */
    public componentWillReceiveProps(nextProps: IPublicationContentProps): void {
        const { publicationId, pageIdOrPublicationTitle } = this.props.params;
        const pageId = TcmId.isValidPageId(pageIdOrPublicationTitle) ? pageIdOrPublicationTitle : null;
        const nextpageIdOrPublicationTitle = nextProps.params.pageIdOrPublicationTitle;
        const nextPageId = TcmId.isValidPageId(nextpageIdOrPublicationTitle) ? nextpageIdOrPublicationTitle : null;
        const pageService = this.context.services.pageService;

        if (!nextPageId) {
            // Navigate to the first page in the publication
            this.setState({
                activeTocItemPath: undefined
            });
        } else if (nextPageId !== pageId) {
            // Load the page
            this.setState({
                isPageLoading: true
            });
            pageService.getPageInfo(publicationId, nextPageId).then(
                this._onPageContentRetrieved.bind(this),
                this._onPageContentRetrievFailed.bind(this));
        }
    }

    /**
     * Invoked immediately before rendering when new props or state are being received.
     * This method is not called for the initial render.
     *
     * @param {IPublicationContentProps} nextProps Next props
     * @param {IPublicationContentState} nextState Next state
     */
    public componentWillUpdate(nextProps: IPublicationContentProps, nextState: IPublicationContentState): void {
        if (nextState.selectedTocItem && !nextState.selectedTocItem.url) {
            this._page.content = `<h1 class="title topictitle1">${nextState.selectedTocItem.title}</h1>`;
            nextState.isPageLoading = false;
            return;
        }
    }

    /**
     * Render the component
     *
     * @returns {JSX.Element}
     */
    public render(): JSX.Element {
        const { isPageLoading, activeTocItemPath, selectedTocItem, publicationTitle, activePageHeader } = this.state;
        const { pageIdOrPublicationTitle, pageTitle, pageAnchor } = this.props.params;
        const pageId = TcmId.isValidPageId(pageIdOrPublicationTitle) ? pageIdOrPublicationTitle : null;
        const { services, router } = this.context;
        const { publicationId } = this.props.params;
        const { taxonomyService } = services;
        const { content, error} = this._page;
        const { rootItems } = this._toc;
        const tocError = this._toc.error;

        return (
            <section className={"sdl-dita-delivery-publication-content"}>
                <Page
                    showActivityIndicator={isPageLoading || false}
                    content={content}
                    error={error}
                    onNavigate={(url: string): void => {
                        /* istanbul ignore else */
                        if (router) {
                            router.push(url);
                        }
                    } }
                    url={pageId ?
                        Url.getPageUrl(publicationId, pageId, publicationTitle, pageTitle || (selectedTocItem && selectedTocItem.title) || "") :
                        Url.getPublicationUrl(publicationId, publicationTitle)}
                    // Wait for the selected toc item to be set to set the anchor
                    // This is needed to make sure components on top are rendered first (eg bread crumbs)
                    anchor={selectedTocItem ? pageAnchor : undefined}
                    scrollOffset={this._topOffset}
                    activeHeader={activePageHeader}>
                    <NavigationMenu isOpen={false}>{/* TODO: use global state store */}
                        <Toc
                            activeItemPath={activeTocItemPath}
                            rootItems={rootItems}
                            loadChildItems={(parentId: string): Promise<ITaxonomy[]> => {
                                return taxonomyService.getSitemapItems(publicationId, parentId);
                            } }
                            onSelectionChanged={this._onTocSelectionChanged.bind(this)}
                            error={tocError}
                            >
                            <span className="separator" />
                        </Toc>
                    </NavigationMenu>
                    <Breadcrumbs
                        publicationId={publicationId}
                        publicationTitle={publicationTitle || ""}
                        loadItemsPath={taxonomyService.getSitemapPath.bind(taxonomyService)}
                        selectedItem={selectedTocItem}
                        />
                </Page>
            </section>
        );
    }

    /**
     * Invoked once, only on the client (not on the server), immediately after the initial rendering occurs.
     */
    public componentDidMount(): void {
        if (ReactDOM) {
            const domNode = ReactDOM.findDOMNode(this) as HTMLElement;
            if (domNode) {
                this._topOffset = domNode.offsetTop;
            }
        }

        window.addEventListener("scroll", this._fixPanels.bind(this));
        window.addEventListener("resize", this._fixPanels.bind(this));
        this._fixPanels();
    }

    /**
     * Component will unmount
     */
    public componentWillUnmount(): void {
        this._isUnmounted = true;

        window.removeEventListener("scroll", this._fixPanels.bind(this));
        window.removeEventListener("resize", this._fixPanels.bind(this));
    }

    private _onTocSelectionChanged(sitemapItem: ITaxonomy, path: string[]): void {
        const { router } = this.context;

        const updatedState: IPublicationContentState = {
            activeTocItemPath: path,
            selectedTocItem: sitemapItem,
            isTocLoading: false
        };
        this.setState(updatedState);

        // When the tree is expanding it is also calling the onTocSelectionChanged callback
        /* istanbul ignore else */
        if (router) {
            // Only navigate to pages which have a location
            const navPath = sitemapItem.url;
            if (navPath) {
                // TODO: validate this after changes for KCWA-321
                if (router.getCurrentLocation().pathname !== navPath) {
                    router.push(navPath);
                }
            }
        }
    }

    private _onPageContentRetrieved(pageInfo: IPage): void {
        const { publicationId } = this.props.params;
        const { activeTocItemPath, isTocLoading } = this.state;
        const page = this._page;
        page.content = pageInfo.content;
        this.setState({
            isPageLoading: false
        });
        // Set the current active path for the tree
        if (Array.isArray(pageInfo.sitemapIds) && pageInfo.sitemapIds.length > 0) {
            // Always take the first sitemap id
            // There is no proper way for having a deep link to the second/third/... occurance inside the toc
            const firstSitemapId = pageInfo.sitemapIds[0];

            this._getActiveSitemapPath(firstSitemapId, path => {
                /* istanbul ignore if */
                if (this._isUnmounted) {
                    return;
                }

                if (isTocLoading) {
                    this._loadTocRootItems(publicationId, path);
                } else if (!activeTocItemPath || path.join("") !== activeTocItemPath.join("")) {
                    this.setState({
                        activeTocItemPath: path
                    });
                }
            });
        } else if (isTocLoading) {
            this._loadTocRootItems(publicationId);
        }
    }

    private _onPageContentRetrievFailed(error: string): void {
        const page = this._page;
        page.error = error;
        page.content = null;
        this._toc.rootItems = [];
        this.setState({
            isPageLoading: false,
            isTocLoading: false
        });
    }

    private _getActiveSitemapPath(sitemapId: string, done: (path: string[]) => void): void {
        const { services } = this.context;
        const { publicationId } = this.props.params;
        services.taxonomyService.getSitemapPath(publicationId, sitemapId).then(
            path => {
                /* istanbul ignore else */
                if (!this._isUnmounted) {
                    done(path.map(item => item.id || "") || []);
                }
            },
            error => {
                /* istanbul ignore else */
                if (!this._isUnmounted) {
                    this._toc.error = error;
                    this.setState({
                        isTocLoading: false,
                        isPageLoading: false
                    });
                }
            });
    }

    private _fixPanels(): void {
        /* istanbul ignore if */
        if (this._isUnmounted) {
            return;
        }

        let ticking = false;

        // Set height of toc and content navigation panel to a maximum
        const domNode = ReactDOM.findDOMNode(this) as HTMLElement;
        if (domNode) {
            const toc = domNode.querySelector("nav.sdl-dita-delivery-toc") as HTMLElement;
            const contentNavigation = domNode.querySelector("nav.sdl-dita-delivery-content-navigation") as HTMLElement;
            const page = domNode.querySelector(".sdl-dita-delivery-page") as HTMLElement;
            if (!ticking) {
                requestAnimationFrame((): void => {
                    this._updatePanels(page, toc, contentNavigation);
                    ticking = false;
                });
                ticking = true;
            }
        }
    }

    private _updatePanels(page: HTMLElement, toc: HTMLElement, contentNavigation: HTMLElement): void {
        // Firefox needs document.documentElement, otherwise scrollTop value will be 0 all the time
        // Chrome though needs document.body to work correctly
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const { sticksToTop } = Html.getFixedPanelInfo(scrollTop, 0, this._topOffset, PANEL_MARGIN);

        if (toc) {
            if (sticksToTop) {
                toc.classList.add(FIXED_NAV_CLASS);
            } else {
                toc.classList.remove(FIXED_NAV_CLASS);
            }
        }

        if (contentNavigation) {
            if (sticksToTop) {
                contentNavigation.classList.add(FIXED_NAV_CLASS);
                // Set left position
                if (page) {
                    contentNavigation.style.left = (page.offsetLeft + page.clientWidth - contentNavigation.offsetWidth) + "px";
                }
            } else {
                contentNavigation.classList.remove(FIXED_NAV_CLASS);
                contentNavigation.style.left = null;
            }

            // Update active title inside content navigation panel
            const pageContent = page.querySelector(".page-content") as HTMLElement;
            if (pageContent) {
                const header = Html.getActiveHeader(document.body, pageContent, 0);
                if (header && header !== this.state.activePageHeader) {
                    this.setState({
                        activePageHeader: header
                    });
                    debounce((): void => {
                        // Make sure the active link is in view
                        const activeLinkEl = contentNavigation.querySelector("li.active") as HTMLElement;
                        if (activeLinkEl) {
                            Html.scrollIntoView(contentNavigation, activeLinkEl);
                        }
                    })();
                }
            }
        }
    }

    private _loadTocRootItems(publicationId: string, path?: string[]): void {
        const { services } = this.context;
        // Get the data for the Toc
        services.taxonomyService.getSitemapRoot(publicationId).then(
            items => {
                /* istanbul ignore else */
                if (!this._isUnmounted) {
                    this._toc.rootItems = items;
                    this.setState({
                        activeTocItemPath: path,
                        isTocLoading: false
                    });
                }
            },
            error => {
                /* istanbul ignore else */
                if (!this._isUnmounted) {
                    this._toc.error = error;
                    this.setState({
                        isTocLoading: false,
                        isPageLoading: false
                    });
                }
            });
    }
}
