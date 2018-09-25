import { connect } from "react-redux";
import { IState } from "store/interfaces/State";
import {
    isPubsLoading,
    getPubListErrorMessage,
    getReleaseVersionsForPub,
    normalizeProductFamily,
    normalizeProductReleaseVersion,
    translateProductReleaseVersions,
    getPubListRepresentatives
} from "store/reducers/Reducer";
import { fetchProductReleaseVersionsByProductFamily } from "store/actions/Api";
import { PublicationsListPresentation, IPublicationsListProps } from "@sdl/dd/PublicationsList/PublicationsListPresentation";

const mapStateToProps = (state: IState, ownProps: IPublicationsListProps) => {
    const { params } = ownProps;
    const error = getPubListErrorMessage(state);
    const productReleaseVersions = getReleaseVersionsForPub(state, params.productFamily);
    const firstInAlist = productReleaseVersions && productReleaseVersions.length ? productReleaseVersions[0].title : "";
    const selectedProductVersion = params.productReleaseVersion ? params.productReleaseVersion : firstInAlist;

    let filter = { productFamily: normalizeProductFamily(params) };

    const publications = getPubListRepresentatives(
        state,
        selectedProductVersion ? { ...filter, productReleaseVersion: normalizeProductReleaseVersion(selectedProductVersion) } : filter
    );

    return {
        error,
        publications,
        productReleaseVersions: translateProductReleaseVersions(productReleaseVersions),
        // dont' show spinner if there are publications cached
        isLoading: publications.length === 0 && isPubsLoading(state),
        selectedProductVersion,
        uiLanguage: state.language
    };
};

const dispatchToProps = {
    fetchProductReleaseVersionsByProductFamily
};

/**
 * Connector of Publication List component for Redux
 *
 * @export
 */
export const PublicationsList = connect(mapStateToProps, dispatchToProps)(PublicationsListPresentation);