import { SearchService } from "services/client/SearchService";
import { TestBase } from "@sdl/models";
import { IWindow } from "interfaces/Window";
import { ISearchQuery } from "interfaces/Search";

class PageServiceTests extends TestBase {

    public runTests(): void {
        const win = (window as IWindow);
        const mocksFlag = win.SdlDitaDeliveryMocksEnabled;
        const searchService = new SearchService();
        const startIndex = 0;
        const _testQuery = "SDL: WEB";
        const _testLocale = "en";

        describe("Search service tests.", (): void => {
            beforeEach(() => {
                win.SdlDitaDeliveryMocksEnabled = true;
            });

            afterEach(() => {
                win.SdlDitaDeliveryMocksEnabled = mocksFlag;
            });

            it("can get search results", (done: () => void): void => {
                const query = {
                    startIndex,
                    locale: _testLocale,
                    searchQuery: _testQuery
                } as ISearchQuery;
                searchService.getSearchResults(query).then(searchResults => {
                    expect(searchResults).toBeDefined();
                    if (searchResults) {
                        expect(searchResults.hits).toBe(148);
                        expect(searchResults.queryResults.length).toBe(10);
                    }
                    done();
                }).catch(error => {
                    fail(`Unexpected error: ${error}`);
                    done();
                });
            });

            it("is not cached in memory", (done: () => void): void => {
                const query = {
                    startIndex,
                    locale: _testLocale,
                    searchQuery: _testQuery
                } as ISearchQuery;
                const spy = spyOn(XMLHttpRequest.prototype, "open").and.callThrough();
                searchService.getSearchResults(query).then(searchResults => {
                    expect(searchResults).toBeDefined();
                    if (searchResults) {
                        expect(searchResults.hits).toBe(148);
                        expect(searchResults.queryResults.length).toBe(10);
                        expect(spy).toHaveBeenCalled();
                    }
                    done();
                }).catch(error => {
                    fail(`Unexpected error: ${error}`);
                    done();
                });
            });
        });
    }
}

new PageServiceTests().runTests();
