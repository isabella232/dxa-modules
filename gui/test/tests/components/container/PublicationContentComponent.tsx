/// <reference path="../../../../src/components/container/App.tsx" />
/// <reference path="../../../../src/global/client/RoutingClient.ts" />
/// <reference path="../../../../src/global/client/LocalizationGlobalize.ts" />

module Sdl.DitaDelivery.Tests {

    import PublicationContent = Components.PublicationContent;

    class PublicationContentComponent extends SDL.Client.Test.TestBase {

        public runTests(): void {

            describe(`PublicationContent component tests.`, (): void => {
                const target = super.createTargetElement();
                const dataStoreMock = new Mocks.DataStore();

                beforeAll(() => {
                    Sdl.DitaDelivery.DataStore = dataStoreMock;
                    Sdl.DitaDelivery.Localization = new Mocks.Localization();
                    Sdl.DitaDelivery.Routing = new Mocks.Routing();
                });

                afterEach(() => {
                    const domNode = ReactDOM.findDOMNode(target);
                    ReactDOM.unmountComponentAtNode(domNode);
                    dataStoreMock.fakeDelay(false);
                });

                afterAll(() => {
                    target.parentElement.removeChild(target);
                });

                it("show loading indicator on initial render", (): void => {
                    dataStoreMock.fakeDelay(true);
                    this._renderComponent(target);
                    const domNode = ReactDOM.findDOMNode(target) as HTMLElement;
                    expect(domNode).not.toBeNull();
                    expect(domNode.querySelector(".sdl-activityindicator")).not.toBeNull("Could not find activity indicator.");
                });

                it("shows toc", (): void => {
                    dataStoreMock.setMockDataToc(null, [
                        {
                            Id: "123",
                            Title: "First element",
                            IsAbstract: false,
                            HasChildNodes: false,
                            Url: ""
                        }
                    ]);
                    this._renderComponent(target);
                    const domNode = ReactDOM.findDOMNode(target) as HTMLElement;
                    expect(domNode).not.toBeNull();
                    // Toc is ready
                    expect(domNode.querySelector(".sdl-dita-delivery-toc .sdl-activityindicator")).toBeNull("Activity indicator should not be rendered.");
                    // Page is still loading
                    expect(domNode.querySelector(".sdl-dita-delivery-page .sdl-activityindicator")).not.toBeNull("Could not find activity indicator.");
                    const nodes = domNode.querySelectorAll(".sdl-treeview .content");
                    expect(nodes.length).toBe(1);
                    expect(nodes.item(0).textContent).toBe("First element");
                });

                it("updates page content when selected site map item changes", (): void => {
                    const pageContent = "<div>Page content!</div>";
                    dataStoreMock.setMockDataToc(null, []);
                    dataStoreMock.setMockDataPage(null, { content: pageContent, title: "Title!" });
                    const component = this._renderComponent(target);
                    component.setState({
                        selectedTocItem: {
                            Id: "123",
                            IsAbstract: false,
                            HasChildNodes: true,
                            Title: "Some page",
                            Url: "page"
                        }
                    });
                    const domNode = ReactDOM.findDOMNode(target) as HTMLElement;
                    expect(domNode).not.toBeNull();
                    expect(domNode.querySelector(".sdl-activityindicator")).toBeNull("Activity indicator should not be rendered.");
                    const pageTitleNode = domNode.querySelector(".page-title") as HTMLElement;
                    expect(pageTitleNode).not.toBeNull("Could not find page title.");
                    expect(pageTitleNode.textContent).toBe("Title!");
                    const pageContentNode = domNode.querySelector(".page-content") as HTMLElement;
                    expect(pageContentNode).not.toBeNull("Could not find page content.");
                    expect(pageContentNode.children.length).toBe(1);
                    expect(pageContentNode.innerHTML).toBe(pageContent);
                });

                it("updates page content when item is selected from toc", (done: () => void): void => {
                    dataStoreMock.setMockDataToc(null, [
                        {
                            Id: "1",
                            Title: "First element",
                            IsAbstract: true,
                            HasChildNodes: true,
                            Url: ""
                        },
                        {
                            Id: "2",
                            Title: "Second element",
                            IsAbstract: true,
                            HasChildNodes: true,
                            Url: ""
                        }
                    ]);
                    this._renderComponent(target);

                    const domNode = ReactDOM.findDOMNode(target) as HTMLElement;
                    expect(domNode).not.toBeNull();
                    // Toc is ready
                    expect(domNode.querySelector(".sdl-dita-delivery-toc .sdl-activityindicator")).toBeNull("Activity indicator should not be rendered.");
                    // Page is still loading
                    expect(domNode.querySelector(".sdl-dita-delivery-page .sdl-activityindicator")).not.toBeNull("Could not find activity indicator.");
                    // Click second element
                    (domNode.querySelectorAll(".sdl-treeview .content")[1] as HTMLDivElement).click();

                    // Treeview uses debouncing for node selection so a timeout is required
                    setTimeout((): void => {
                        // All is loaded
                        expect(domNode.querySelector(".sdl-activityindicator")).toBeNull("Activity indicator should not be rendered.");
                        const pageTitleNode = domNode.querySelector(".page-title") as HTMLElement;
                        expect(pageTitleNode).not.toBeNull("Could not find page title.");
                        expect(pageTitleNode.textContent).toBe("Second element");
                        done();
                    }, 200);
                });

                it("updates page content with title when a site map item without url is selected", (): void => {
                    dataStoreMock.setMockDataToc(null, []);
                    const title = "Some page";
                    const component = this._renderComponent(target);
                    component.setState({
                        selectedTocItem: {
                            Id: "12345",
                            IsAbstract: true,
                            HasChildNodes: true,
                            Title: title,
                            Url: ""
                        }
                    });
                    const domNode = ReactDOM.findDOMNode(target) as HTMLElement;
                    expect(domNode).not.toBeNull();
                    expect(domNode.querySelector(".sdl-activityindicator")).toBeNull("Activity indicator should not be rendered.");
                    const pageTitleNode = domNode.querySelector(".page-title") as HTMLElement;
                    expect(pageTitleNode).not.toBeNull("Could not find page title.");
                    expect(pageTitleNode.textContent).toBe(title);
                });

                it("shows an error message when page info fails to load", (done: () => void): void => {
                    dataStoreMock.setMockDataToc(null, [{
                        Id: "123456",
                        IsAbstract: false,
                        HasChildNodes: true,
                        Title: "Some page",
                        Url: "page-url"
                    }]);
                    dataStoreMock.setMockDataPage("Page failed to load!");
                    this._renderComponent(target);
                    const domNode = ReactDOM.findDOMNode(target) as HTMLElement;
                    expect(domNode).not.toBeNull();

                    // Wait for the tree view to select the first node
                    // Treeview uses debouncing for node selection so a timeout is required
                    setTimeout((): void => {
                        expect(domNode.querySelector(".sdl-activityindicator")).toBeNull("Activity indicator should not be rendered.");
                        const validationMessageNode = domNode.querySelector(".sdl-validationmessage");
                        expect(validationMessageNode).not.toBeNull("Could not find validation message.");
                        expect(validationMessageNode.textContent).toBe("Page failed to load!");
                        done();
                    }, 100);
                });

            });

        }

        private _renderComponent(target: HTMLElement): PublicationContent {
            return ReactDOM.render(
                (<PublicationContent publicationId={"123"}/>)
                , target) as PublicationContent;
        }
    }

    new PublicationContentComponent().runTests();
}
