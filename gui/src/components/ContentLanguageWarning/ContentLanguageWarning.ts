import { IState } from "store/interfaces/State";
import { ContentLanguageWarningPresentation } from "./ContentLanguageWarningPresentation";
import { connect } from "react-redux";
import { getCurrentPub, getPubById, getPubByIdAndLang } from "store/reducers/Reducer";

const mapStateToProps = (state: IState) => {
    const { publicationId } = getCurrentPub(state);
    const publication = getPubById(state, publicationId);
    const contentLanguage = publication.language || state.language;
    const match = state.language === contentLanguage;
    const languagePublication = getPubByIdAndLang(state, publicationId, state.language);

    return {
        uiLanguage: state.language,
        match,
        languagePublication
    };
};

export const ContentLanguageWarning = connect(mapStateToProps)(ContentLanguageWarningPresentation);