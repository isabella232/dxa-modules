import { Store } from "redux";
import { String } from "sdl-models";
import { language } from "store/reducers/Language";
import { changeLanguage } from "store/actions/Actions";
import { ILocalizationService, ILanguage } from "services/interfaces/LocalizationService";
import { IState } from "store/interfaces/State";

interface IDic { [path: string]: string; };
interface IDics { [lang: string]: IDic; };

const DEFAULT_LANGUAGE: string = "en";
const LANGUAGE_LOCALSTORAGE: string =  "sdl-dita-delivery-app-langugae";
// Need to be loaded or configured somehow.
const Languages = ["en", "nl"];

const loadDics = (langs: string[]): IDics => Object.assign({},
     ...langs.map(lang => require(`resources/resources.${lang}`))
    .map((dictionary: {}) => dictionary as IDic)
    .map((dictionary: IDic, index: number) => ({[langs[index]]: dictionary})));

const Resources: IDics = loadDics(Languages);
const translate = (lang: string) => (path: string) => lang in Resources ? Resources[lang][path] : null;

const formatMessage = (resource: string, variables?: string[]) => Array.isArray(variables) ? String.format(resource, variables) : resource;

/**
 * Localization service
 *
 * @export
 * @class LocalizationService
 * @implements {ILocalizationService}
 */
export class LocalizationService implements ILocalizationService {
    /**
     *
     * @type {string[]}
     * @memberOf LocalizationService
     */
    public rtlLanguages: string[] = ["ar", "dv", "fa", "ff", "he", "iw", "ps", "ur"];

    private language: string;

    /**
     * Creates an instance of LocalizationService.
     */
    public constructor() {
        this.language = localStorage.getItem(LANGUAGE_LOCALSTORAGE) || DEFAULT_LANGUAGE;

        this.formatMessage = this.formatMessage.bind(this);
        this.getDirection = this.getDirection.bind(this);
    }

    /**
     * Save current store to local storage
     *
     * @param {Store<IState>} store
     * @returns void
     */
    public setStore(store: Store<IState>): void {
        store.dispatch(changeLanguage(this.language));
        store.subscribe((): void => {
            const newLanguage = store.getState().language;

            if (newLanguage !== this.language) {
                this.language = newLanguage;
                localStorage.setItem(LANGUAGE_LOCALSTORAGE, this.language);
            }
        });
    }

    /**
     * Format a message
     *
     * @param {string} path Resource path
     * @param {string[]} [variables] Variables
     * @returns {string}
     */
    public formatMessage(path: string, variables?: string[]): string {
        const resource = translate(this.language)(path) || translate(DEFAULT_LANGUAGE)(path);
        return resource ? formatMessage(resource, variables) : `[${language}] Unable to localize: ${path}`;
    }

    /**
     * Get list of all languages
     *
     * @returns {ILanguage[]}
     */
    public getLanguages(): ILanguage[] {
        let languages = [];
        languages.push({"name": "Deutsch", "iso": "de"});
        languages.push({"name": "English", "iso": "en"});
        languages.push({"name": "עברית", "iso": "he"});
        languages.push({"name": "日本語", "iso": "ja"});
        languages.push({"name": "Nederlands", "iso": "nl"});
        languages.push({"name": "中文", "iso": "zh"});
        languages.push({"name": "TEST Arabic", "iso": "ar"});
        languages.push({"name": "Test Ivrit", "iso": "iw"});
        return languages;
    }

    /**
     * Convert language iso code to its name
     *
     * @param   {string} iso
     * @returns {string}
     */
    public isoToName(iso: string): string {
        const languages = this.getLanguages();
        const options = languages.filter((language: ILanguage) => language.iso == iso);
        return options[0] && options[0].name || iso;
    }

    /**
     * Convert language name to its iso code
     *
     * @param   {string} name
     * @returns {string}
     */
    public nameToIso(name: string): string {
        const languages = this.getLanguages();
        const options = languages.filter((language: ILanguage) => language.name == name);
        return options[0] && options[0].iso || name;
    }

    /**
     * Determine language direction
     *
     * @param {string} lang
     * @returns {("rtl" | "ltr")}
     */
    public getDirection(lang: string): "rtl" | "ltr" {
        return this.rtlLanguages.some((val: string) => val === lang) ? "rtl" : "ltr";
    }
}

export let localization = new LocalizationService();