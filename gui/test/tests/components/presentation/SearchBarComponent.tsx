import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-addons-test-utils";
import { SearchBar, ISearchBarProps } from "@sdl/dd/presentation/SearchBar";
import { TestBase } from "@sdl/models";

class SearchBarComponent extends TestBase {

    public runTests(): void {

        describe(`Search Bar component tests.`, (): void => {
            const target = super.createTargetElement();

            afterEach(() => {
                const domNode = ReactDOM.findDOMNode(target);
                ReactDOM.unmountComponentAtNode(domNode);
            });

            afterAll(() => {
                if (target.parentElement) {
                    target.parentElement.removeChild(target);
                }
            });

            it("shows placeholder text", (): void => {
                const placeholderLabel = "Hello world!";
                this._renderComponent({
                    placeholderLabel: placeholderLabel
                }, target);
                const input = document.querySelector(".sdl-dita-delivery-searchbar input") as HTMLInputElement;
                expect(input.getAttribute("placeholder")).toBe(placeholderLabel);
            });

            it("triggers search on enter key press", (done: () => void): void => {
                const searchQuery = "search on enter key press";
                this._renderComponent({
                    placeholderLabel: "",
                    onSearch: query => {
                        expect(query).toBe(searchQuery);
                        done();
                    }
                }, target);
                const input = document.querySelector(".sdl-dita-delivery-searchbar input") as HTMLInputElement;
                input.value = searchQuery;
                TestUtils.Simulate.keyUp(input, {
                    keyCode: 13
                });
            });

            it("triggers search on search button click", (done: () => void): void => {
                const searchQuery = "search on button click";
                this._renderComponent({
                    placeholderLabel: "",
                    onSearch: query => {
                        expect(query).toBe(searchQuery);
                        done();
                    }
                }, target);
                const input = document.querySelector(".sdl-dita-delivery-searchbar input") as HTMLInputElement;
                input.value = searchQuery;
                TestUtils.Simulate.keyUp(input);
                const button = document.querySelector(".sdl-dita-delivery-searchbar .search-button") as HTMLInputElement;
                TestUtils.Simulate.click(button);
            });

        });
    }

    private _renderComponent(props: ISearchBarProps, target: HTMLElement): void {
        ReactDOM.render(<SearchBar {...props} />, target);
    }
}

new SearchBarComponent().runTests();
