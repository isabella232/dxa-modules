import { combineReducers } from "store/reducers/CombineReducers";
import { IConditionsState, IConditionMap } from "store/interfaces/Conditions";

import showDialog, * as ShowDialog from "./showDialog";
import allConditions, * as AllConditions from "./allConditions";
import lastConditions, * as LastConditions from "./lastConditions";
import editingConditions, * as EditingConditions from "./editingConditions";

const conditions = combineReducers({
    showDialog,
    allConditions,
    lastConditions,
    editingConditions
});

export default conditions;
export const isDialogVisible = (state: IConditionsState) => ShowDialog.isVisible(state.showDialog);
export const getAllByPubId = (state: IConditionsState, pubId: string): IConditionMap => AllConditions.getByPubId(state.allConditions, pubId);
export const getLastConditions = (state: IConditionsState, pubId: string): IConditionMap => LastConditions.getLastConditions(state.lastConditions, pubId);
export const getEditingConditions = (state: IConditionsState) => EditingConditions.getConditions(state.editingConditions);