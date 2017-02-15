import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";
import { Toc, ITocProps } from "components/presentation/Toc";
import { ITaxonomy } from "interfaces/Taxonomy";
import { Promise } from "es6-promise";
import { TreeView } from "sdl-controls-react-wrappers";
import { TestBase } from "sdl-models";
import { ComponentWithContext } from "test/mocks/ComponentWithContext";

const DELAY = 100;

class TocComponent extends TestBase {

    public runTests(): void {

        describe(`Toc component tests.`, (): void => {
            const target = super.createTargetElement();
            let toc: Toc;

            const rootItems: ITaxonomy[] = [{
                id: "root",
                title: "Root1",
                hasChildNodes: true
            }, {
                id: "root-error",
                title: "Root2",
                hasChildNodes: true
            }];
            const loadChildItems = (parentId: string): Promise<ITaxonomy[]> => {

                if (parentId === "root") {
                    return new Promise((resolve: (taxonomy: ITaxonomy[]) => void) => {
                        setTimeout((): void => {
                            resolve([{
                                id: "12345",
                                title: "Child1",
                                hasChildNodes: true
                            },
                            {
                                id: "123456",
                                title: "Child2",
                                hasChildNodes: true
                            }]);
                        }, DELAY);
                    });
                } else if (parentId === "12345") {
                    return new Promise((resolve: (taxonomy: ITaxonomy[]) => void) => {
                        setTimeout((): void => {
                            resolve([{
                                id: "12345-nested",
                                title: "NestedChild1",
                                hasChildNodes: false
                            },
                            {
                                id: "12345-nested2",
                                title: "NestedChild2",
                                hasChildNodes: false
                            }]);
                        }, DELAY);
                    });
                } else {
                    return Promise.reject("Failed to load child nodes");
                }
            };

            beforeEach(() => {
                const props: ITocProps = {
                    loadChildItems: loadChildItems,
                    rootItems: rootItems,
                    onRetry: () => {
                        toc.setState({
                            error: null
                        });
                    }
                };
                toc = this._renderComponent(props, target);
            });

            afterEach(() => {
                const domNode = ReactDOM.findDOMNode(target);
                ReactDOM.unmountComponentAtNode(domNode);
            });

            afterAll(() => {
                target.parentElement.removeChild(target);
            });

            it("shows the root nodes on initial render", (): void => {
                // tslint:disable-next-line:no-any
                const treeView = TestUtils.findRenderedComponentWithType(toc, TreeView as any);
                expect(treeView).not.toBeNull();
                const domNode = ReactDOM.findDOMNode(treeView);
                const nodes = domNode.querySelectorAll(".content");
                expect(nodes.length).toBe(2);
                expect(nodes.item(0).textContent).toBe(rootItems[0].title);
            });

            it("expands the root node upon click", (done: () => void): void => {
                // tslint:disable-next-line:no-any
                const treeView = TestUtils.findRenderedComponentWithType(toc, TreeView as any);
                expect(treeView).not.toBeNull();
                const domNode = ReactDOM.findDOMNode(treeView);
                (domNode.querySelector(".expand-collapse") as HTMLDivElement).click();
                // Use a timeout to allow the DataStore to return a promise with the data
                setTimeout((): void => {
                    const nodes = domNode.querySelectorAll(".content");
                    expect(nodes.length).toBe(4);
                    expect(nodes.item(0).textContent).toBe(rootItems[0].title);
                    expect(nodes.item(1).textContent).toBe("Child1");
                    done();
                }, DELAY + 1);
            });

            it("shows an error when node failes to expand", (done: () => void): void => {
                // tslint:disable-next-line:no-any
                const treeView = TestUtils.findRenderedComponentWithType(toc, TreeView as any);
                expect(treeView).not.toBeNull();
                const domNode = ReactDOM.findDOMNode(treeView);
                (domNode.querySelectorAll(".expand-collapse").item(1) as HTMLDivElement).click();
                // Use a timeout to allow the DataStore to return a promise with the data
                setTimeout((): void => {
                    const node = domNode.querySelector(".sdl-dita-delivery-toc-list-fail");
                    expect(node).not.toBeNull();
                    expect(node.querySelector("p").textContent).toBe("mock-error.toc.items.not.found");
                    done();
                }, DELAY + 1);
            });

            it("triggers only one selection change when expanding nodes", (done: () => void): void => {
                // Load root nodes
                // tslint:disable-next-line:no-any
                const treeView = TestUtils.findRenderedComponentWithType(toc, TreeView as any);
                expect(treeView).not.toBeNull();
                const domNode = ReactDOM.findDOMNode(treeView);
                const nodes = domNode.querySelectorAll(".content");
                expect(nodes.length).toBe(2);
                expect(nodes.item(0).textContent).toBe(rootItems[0].title);
                // Reload toc and use child path
                const activeItemPath = [rootItems[0].id || "", "12345", "12345-nested"];
                const props: ITocProps = {
                    loadChildItems: loadChildItems,
                    rootItems: rootItems,
                    activeItemPath: activeItemPath,
                    onSelectionChanged: (sitemapItem: ITaxonomy, path: string[]): void => {
                        expect(path).toEqual(activeItemPath);
                        done();
                    },
                    onRetry: () => {}
                };
                this._renderComponent(props, target);
            });

            it("selects first root node when setting active item path to undefined", (done: () => void): void => {
                // tslint:disable-next-line:no-any
                const treeView = TestUtils.findRenderedComponentWithType(toc, TreeView as any);
                expect(treeView).not.toBeNull();

                const selectFirstRootNode = (): void => {
                    // Reload toc and make active item path undefined
                    // Expected is that the first root node is selected
                    const propsReset: ITocProps = {
                        loadChildItems: loadChildItems,
                        rootItems: rootItems,
                        activeItemPath: undefined,
                        onSelectionChanged: (sitemapItem: ITaxonomy, path: string[]): void => {
                            expect(path).toEqual([rootItems[0].id]);
                            done();
                        },
                        onRetry: () => {}
                    };
                    this._renderComponent(propsReset, target);
                };

                // Set active item path to a child path
                const activeItemPath = [rootItems[0].id || "", "12345", "12345-nested"];
                const props: ITocProps = {
                    loadChildItems: loadChildItems,
                    rootItems: rootItems,
                    activeItemPath: activeItemPath,
                    onSelectionChanged: (sitemapItem: ITaxonomy, path: string[]): void => {
                        expect(path).toEqual(activeItemPath);
                        selectFirstRootNode();
                    },
                    onRetry: () => {}
                };
                this._renderComponent(props, target);
            });

            it("can navigate between abstract and regular pages", (done: () => void): void => {
                // tslint:disable-next-line:no-any
                const treeView = TestUtils.findRenderedComponentWithType(toc, TreeView as any);
                expect(treeView).not.toBeNull();

                const switchBetweenChildNodes = (prevProps: ITocProps): void => {
                    const firstChildPath = [rootItems[0].id || "", "12345", "12345-nested"];
                    const secondChildPath = [rootItems[0].id || "", "12345", "12345-nested2"];
                    let timesClicked = 0;
                    let runAfterOnSelectionChanged: () => void;
                    let onSelectionChangedSpy: jasmine.Spy;
                    prevProps.onSelectionChanged = (sitemapItem: ITaxonomy, path: string[]): void => {
                        if (timesClicked === 1) {
                            expect(path).toEqual(secondChildPath);
                        } else if (timesClicked === 2) {
                            expect(path).toEqual(firstChildPath);
                        } else {
                            expect(path).toEqual(secondChildPath);
                            expect(onSelectionChangedSpy).toHaveBeenCalledTimes(3);
                            done();
                            return;
                        }
                        runAfterOnSelectionChanged();
                    };
                    onSelectionChangedSpy = spyOn(prevProps, "onSelectionChanged").and.callThrough();
                    this._renderComponent(prevProps, target);
                    const domNode = ReactDOM.findDOMNode(treeView);
                    // Select second child by clicking on it
                    const selectSecondChildNode = (): void => {
                        const secondNestedChildNode = domNode.querySelectorAll(".content").item(3) as HTMLDivElement;
                        expect(secondNestedChildNode && secondNestedChildNode.textContent).toBe("NestedChild2");
                        timesClicked++;
                        secondNestedChildNode.click();
                    };
                    runAfterOnSelectionChanged = (): void => {
                        // Re-render to trigger componentWillReceiveProps update
                        // This is needed to test if _isExpanding is set correctly on an update
                        prevProps.activeItemPath = secondChildPath;
                        this._renderComponent(prevProps, target);
                        // Select the the first child again
                        const firstNestedChildNode = domNode.querySelectorAll(".content").item(2) as HTMLDivElement;
                        expect(firstNestedChildNode && firstNestedChildNode.textContent).toBe("NestedChild1");
                        timesClicked++;
                        runAfterOnSelectionChanged = (): void => {
                            // Re-render to trigger componentWillReceiveProps update
                            // This is needed to test if _isExpanding is set correctly on an update
                            prevProps.activeItemPath = firstChildPath;
                            this._renderComponent(prevProps, target);
                            // Select second node again
                            selectSecondChildNode();
                        };
                        firstNestedChildNode.click();
                    };
                    selectSecondChildNode();
                };

                // Set active item path to a child path
                const activeItemPath = [rootItems[0].id || "", "12345", "12345-nested"];
                const props: ITocProps = {
                    loadChildItems: loadChildItems,
                    rootItems: rootItems,
                    activeItemPath: activeItemPath,
                    onSelectionChanged: (sitemapItem: ITaxonomy, path: string[]): void => {
                        expect(path).toEqual(activeItemPath);
                        switchBetweenChildNodes(props);
                    },
                    onRetry: () => {}
                };
                this._renderComponent(props, target);
            });

            it("correct error component rendering", (done: () => void): void => {
                toc.setState({
                    error: "Oops, error!"
                });

                const element = document.querySelector(".sdl-dita-delivery-error-toc");
                expect(element).not.toBeNull();

                const message = element.querySelector(".sdl-dita-delivery-error-toc-message");
                expect(message.textContent).toEqual("mock-error.toc.not.found");

                element.querySelector("button").click();

                const element2 = document.querySelector(".sdl-dita-delivery-error-toc");
                expect(element2).toBeNull();
                done();
            });
        });

    }

    private _renderComponent(props: ITocProps, target: HTMLElement): Toc {
        const comp = ReactDOM.render(
            <ComponentWithContext>
                <Toc {...props} />
            </ComponentWithContext>, target) as React.Component<{}, {}>;
        return TestUtils.findRenderedComponentWithType(comp, Toc) as Toc;
    }
}

new TocComponent().runTests();
