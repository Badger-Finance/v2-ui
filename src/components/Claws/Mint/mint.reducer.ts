import BigNumber from 'bignumber.js';
import { validateAmountBoundaries } from 'utils/componentHelpers';
import { ClawParam } from '../claw.model';

export interface State {
	collateral: ClawParam;
	synthetic: ClawParam;
}

interface CollateralAmountChange {
	amount: string;
	collateralToken: any;
}

interface CollateralPercentageChange {
	percentage: number;
	collateralToken: any;
}

interface SyntheticAmountChange {
	amount: string;
	synthetic: any;
	collateralToken: any;
}

interface SyntheticOptionChange {
	percentage: number;
	syntheticData: any;
	collateralToken: any;
	maxClaw: any;
	validateClaw: boolean;
}

type ActionType =
	| { type: 'COLLATERAL_AMOUNT_CHANGE'; payload: CollateralAmountChange }
	| { type: 'COLLATERAL_OPTION_CHANGE'; payload: string }
	| { type: 'COLLATERAL_PERCENTAGE_CHANGE'; payload: CollateralPercentageChange }
	| { type: 'SYNTHETIC_AMOUNT_CHANGE'; payload: SyntheticAmountChange }
	| { type: 'SYNTHETIC_OPTION_CHANGE'; payload: string }
	| { type: 'SYNTHETIC_PERCENTAGE_CHANGE'; payload: SyntheticOptionChange };

export function mintReducer(state: State, action: ActionType): State {
	switch (action.type) {
		case 'COLLATERAL_AMOUNT_CHANGE': {
			const { amount, collateralToken } = action.payload;
			return {
				collateral: {
					...state.collateral,
					amount,
					error: validateAmountBoundaries({
						amount: new BigNumber(amount).multipliedBy(10 ** collateralToken.decimals),
						maximum: collateralToken.balance,
					}),
				},
				synthetic: {
					...state.synthetic,
					amount: undefined,
				},
			};
		}
		case 'COLLATERAL_OPTION_CHANGE': {
			return {
				synthetic: {},
				collateral: {
					...state.collateral,
					amount: undefined,
					selectedOption: action.payload,
				},
			};
		}
		case 'COLLATERAL_PERCENTAGE_CHANGE': {
			const { percentage, collateralToken } = action.payload;
			return {
				...state,
				collateral: {
					...state.collateral,
					amount: collateralToken.balance
						.multipliedBy(percentage / 100)
						.dividedBy(10 ** collateralToken.decimals)
						.toFixed(collateralToken.decimals, BigNumber.ROUND_DOWN),
				},
			};
		}
		case 'SYNTHETIC_AMOUNT_CHANGE': {
			const { amount, collateralToken, synthetic } = action.payload;
			return {
				...state,
				synthetic: {
					...state.synthetic,
					amount,
					error: validateAmountBoundaries({
						amount: new BigNumber(amount).multipliedBy(10 ** collateralToken.decimals),
						minimum: synthetic.minSponsorTokens,
					}),
				},
			};
		}
		case 'SYNTHETIC_OPTION_CHANGE': {
			return {
				...state,
				synthetic: {
					...state.synthetic,
					selectedOption: action.payload,
				},
			};
		}
		case 'SYNTHETIC_PERCENTAGE_CHANGE': {
			const { percentage, collateralToken, syntheticData, validateClaw, maxClaw } = action.payload;

			const amount = maxClaw.multipliedBy(percentage / 100);
			return {
				...state,
				synthetic: {
					...state.synthetic,
					amount: amount
						.dividedBy(10 ** collateralToken.decimals)
						.toFixed(collateralToken.decimals, BigNumber.ROUND_DOWN),
					error: validateAmountBoundaries({
						amount,
						maximum: validateClaw ? maxClaw : undefined,
						minimum: syntheticData.minSponsorTokens,
					}),
				},
			};
		}
		default:
			return state;
	}
}
