import "ts-helpers";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "@sdl/dd/container/App/App";
import { IServices } from "interfaces/Services";
import { PageService } from "services/client/PageService";
import { PublicationService } from "services/client/PublicationService";
import { TaxonomyService } from "services/client/TaxonomyService";
import { localization } from "services/common/LocalizationService";

import { Provider } from "react-redux";
import { IState } from "store/interfaces/State";
import { configureStore } from "store/Store";
import { Store } from "redux";

import "@sdl/controls-react-wrappers/dist/stylesheets/main";

const mainElement = document.getElementById("main-view-target");

/**
 * Set instances for services
 */
const services: IServices = {
    pageService: new PageService(),
    publicationService: new PublicationService(),
    localizationService: localization,
    taxonomyService: new TaxonomyService()
};

const store: Store<IState> = configureStore({});

localization.setStore(store);

const render = (AppComp: typeof App): void => {
    if (!mainElement) {
        console.error(`Unable to locate element to render application.`);
    } else {
        ReactDOM.render(
            <Provider store={store}>
                <AppComp services={services} />
            </Provider>, mainElement);
    }
};
render(App);

// Enable Hot Module Replacement (HMR)
if (module.hot) {
    module.hot.accept("./components/container/App/App", () => {
        // If we receive a HMR request for our App container, then reload it using require (we can't do this dynamically with import)
        const NextApp = (require("./components/container/App/App") as { App: typeof App }).App;
        render(NextApp);
    });
}
