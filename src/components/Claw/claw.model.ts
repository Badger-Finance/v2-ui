import { BOUNDARY_ERROR } from 'utils/componentHelpers';

export interface ClawParam {
	amount?: string;
	selectedOption?: string;
	error?: BOUNDARY_ERROR;
}

export interface ClawActionDetail {
	name: string;
	text?: string;
	subText?: string;
}
