import { find, chain } from "lodash";
import { PUBLICATIONS_LOADED, PUBLICATIONS_LOADING } from "store/actions/Actions";
import { IPublication } from "interfaces/Publication";
import { handleAction, combineReducers, combine } from "./CombineReducers";
import { PUBLICATIONS_LOADING_ERROR } from "store/actions/Actions";
import { IPublicationsMap, IPublicationsState } from "store/interfaces/State";
import { DEFAULT_LANGUAGE } from "services/common/LocalizationService";
import { DEFAULT_UNKNOWN_PRODUCT_FAMILY_TITLE, DEFAULT_UNKNOWN_PRODUCT_RELEASE_VERSION } from "models/Publications";
import { IPublicationsListPropsParams } from "@sdl/dd/PublicationsList/PublicationsListPresentation";
import { IState } from "store/interfaces/State";
import Version from "utils/Version";
import { String } from "utils/String";

const buildMap = (currentMap: IPublicationsMap, publications: IPublication[]) => {
    return Object.assign({}, currentMap, ...publications.map(publication => ({[publication.id]: publication})));
};

export const notFound = (id: string): IPublication => ({
    id,
    title: "",
    logicalId: "",
    version: "",
    createdOn: new Date(2000, 1, 1)
});

const byId = handleAction(
    PUBLICATIONS_LOADED,
    (state: IPublicationsMap, payload: IPublication[]): IPublicationsMap => buildMap(state, payload),
    {}
);

const isLoading = combine(
    handleAction(PUBLICATIONS_LOADING, () => true, false),
    handleAction(PUBLICATIONS_LOADED, () => false, false),
    handleAction(PUBLICATIONS_LOADING_ERROR, () => false, false)
);

const lastError = combine(
    handleAction(PUBLICATIONS_LOADING_ERROR, (message: string) => message, ""),
    handleAction(PUBLICATIONS_LOADED, () => "", "")
);

export const publications = combineReducers({
    byId,
    isLoading,
    lastError
});

// Selectors
const productReleaseVersionHack = (prop: string, obj: {}) => {
    if (prop !== "productReleaseVersion") {
         // tslint:disable-next-line:no-any
        return (obj as any)[prop];
    }
    // tslint:disable-next-line:no-any
    let version = Version.normalize((obj as any)[prop]);
    return version ? version : null;
};

/**
 * Returns lisf of publicaions that are in state.
 * You can filter list of publications that  you need for different usecases
 * Example: getPubList(state, {
 *  language: "en",
 *  productFamily: "Kupchino"
 *  "!id": "myId"
 * });
 * @param state
 * @param filter
 */
export const getPubList = (state: IPublicationsState, filter: {} = {}): IPublication[] => {
    const keys = Object.keys(filter);
    return Object.values(state.byId)
        .filter((publication) => {
            return keys.every(prop => {
                const propName = /^\!(.+)/.test(prop) ? RegExp.$1 : prop;
                if (propName in publication === false) {
                    console.warn(`There is not property ${prop} in`, publication);
                }

                const valueFilter = productReleaseVersionHack(propName, filter);
                const valueObj = productReleaseVersionHack(propName, publication);
                return propName === prop ? valueFilter === valueObj :  valueFilter !== valueObj;
            });
        });
};
export const getPubById = (state: IPublicationsState, id: string): IPublication => id in state.byId ? state.byId[id] : notFound(id);

export const getPubsByLang = (state: IPublicationsState, language: string) => getPubList(state, { language });

export const getPubForLang = (state: IPublicationsState, publication: IPublication, language: string) => {
    return getPubList(state, {
        "!id": publication.id,
        language,
        versionRef: publication.versionRef,
        productReleaseVersion: publication.productReleaseVersion
    })[0] || notFound(publication.id);
};

export const getPubListRepresentatives = (state: IState, filter: {}): IPublication[] => {
    // Groups publications by versionRef
    // find one we need by language or fallback language
    return chain(getPubList(state.publications, filter))
        .groupBy("versionRef")
        .values()
        .flatMap((pubsByRef: IPublication[]) => find(pubsByRef, {language: state.language})
                                             || find(pubsByRef, {language: DEFAULT_LANGUAGE}))
        .value()
        .filter(publiction => publiction !== undefined);
};

export const isLoadnig = (state: IPublicationsState): boolean => state.isLoading;
export const getLastError = (state: IPublicationsState): string => state.lastError;

export const normalizeProductFamily = (params: IPublicationsListPropsParams): string | null =>
    String.normalize(params.productFamily) === String.normalize(DEFAULT_UNKNOWN_PRODUCT_FAMILY_TITLE) ? null : params.productFamily;
export const normalizeProductReleaseVersion = (params: IPublicationsListPropsParams | string): string | null | undefined => {
    const value = typeof params === "string" ? params : params.productReleaseVersion || "";
    return String.normalize(value) === String.normalize(DEFAULT_UNKNOWN_PRODUCT_RELEASE_VERSION) ? null : value;
};

export const isPublicationFound = (state: IPublicationsState, publicationId: string): boolean =>
    JSON.stringify(getPubById(state, publicationId)) !== JSON.stringify(notFound(publicationId));
