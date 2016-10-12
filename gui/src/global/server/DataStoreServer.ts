/// <reference path="../../models/Page.ts" />
/// <reference path="../../models/Toc.ts" />

module Sdl.DitaDelivery {

    import ISitemapItem = Server.Models.ISitemapItem;
    import IPageInfo = Sdl.DitaDelivery.Models.IPageInfo;
    import IPublication = Server.Models.IPublication;

    /**
     * Data store for the server.
     *
     * @export
     * @class DataStore
     */
    export class DataStoreServer implements IDataStore {

        private _mockDataPublications: {
            error: string | null;
            publications: IPublication[];
        } = {
            error: null,
            publications: []
        };

        private _mockDataPage: {
            error: string | null;
            info: IPageInfo;
        } = {
            error: null,
            info: {
                content: "<span>Page content!</span>",
                title: "Page title!"
            }
        };

        private _mockDataToc: {
            error: string | null;
            children: ISitemapItem[]
        } = {
            error: null,
            children: []
        };

        private _mockDataPublication: {
            error: string | null,
            title: string | undefined
        } = {
            error: null,
            title: "MP330"
        };

        /**
         * Get the list of publications
         *
         * @returns {Promise<IPublication[]>} promise to return the items
         * 
         * @memberOf DataStoreServer
         */
        public getPublications(): Promise<IPublication[]> {
            const { error, publications } = this._mockDataPublications;
            if (error) {
                return Promise.reject(error);
            } else {
                return Promise.resolve(publications);
            }
        }

        /**
         * Get the root objects of the sitemap
         *
         * @returns {Promise<ISitemapItem[]>} promise to return the items
         * 
         * @memberOf DataStoreServer
         */
        public getSitemapRoot(): Promise<ISitemapItem[]> {
            return this.getSitemapItems("root");
        }

        /**
         * Get the site map items for a parent
         *
         * @param {string} parentId
         * @returns {Promise<ISitemapItem[]>} promise to return the items
         * 
         * @memberOf DataStoreServer
         */
        public getSitemapItems(parentId: string): Promise<ISitemapItem[]> {
            const { error, children } = this._mockDataToc;
            if (error) {
                return Promise.reject(error);
            } else {
                return Promise.resolve(children);
            }
        }

        /**
         * Get page information
         *
         * @param {string} pageId
         * @returns {Promise<IPageInfo>} promise to returns the content
         * 
         * @memberOf DataStoreServer
         */
        public getPageInfo(pageId: string): Promise<IPageInfo> {
            const { error, info } = this._mockDataPage;
            if (error) {
                return Promise.reject(error);
            } else {
                return Promise.resolve(info);
            }
        }

        /**
         * Get the publication title
         *
         * @param {string} publicationId
         * @returns {Promise<string>} promise to returns the title
         * 
         * @memberOf DataStoreServer
         */
        public getPublicationTitle(publicationId: string): Promise<string> {
            const { error, title } = this._mockDataPublication;
            if (error) {
                return Promise.reject(error);
            } else {
                return Promise.resolve(title);
            }
        }

        /**
         * Get the full path for a sitemap item within a sitemap
         *
         * @param {string} pageId The page id
         * @returns {Promise<string[]>} promise to return the full path
         * 
         * @memberOf DataStoreServer
         */
        public getSitemapPath(pageId: string): Promise<string[]> {
            return new Promise((resolve: (path?: string[]) => void, reject: (error: string | null) => void) => {
                //
            });
        }
    }

}
