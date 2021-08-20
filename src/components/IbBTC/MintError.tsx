import React from 'react';
import BigNumber from 'bignumber.js';
import { Grid, makeStyles, Tooltip } from '@material-ui/core';

import { toFixedDecimals } from 'mobx/utils/helpers';
import { ErrorText } from './Common';
import { IbbtcOptionToken } from '../../mobx/model/tokens/ibbtc-option-token';
import { MintLimits } from '../../mobx/model/strategies/mint-limits';

interface Props {
	token: IbbtcOptionToken;
	amount: BigNumber;
	limits: MintLimits;
	onUserLimitClick: (limit: BigNumber) => void;
}

const useStyles = makeStyles(() => ({
	userLimit: {
		cursor: 'pointer',
	},
}));

export const MintError = ({ token, amount, limits, onUserLimitClick }: Props): JSX.Element | null => {
	const classes = useStyles();
	const { userLimit, individualLimit, globalLimit, allUsersLimit } = limits;

	const UserLimit = () => (
		<Grid container>
			<ErrorText variant="subtitle1">
				<span>{`Your current mint amount limit is `}</span>
				<Tooltip
					arrow
					className={classes.userLimit}
					title="Apply amount"
					placement="top"
					onClick={() => onUserLimitClick(userLimit)}
				>
					<span>{`${toFixedDecimals(token.unscale(userLimit), 6)} `}</span>
				</Tooltip>
				<span>{`${token.symbol}.`}</span>
			</ErrorText>
			<ErrorText variant="subtitle1">
				{`Individual total mint amount limit is currently ${token
					.unscale(individualLimit)
					.toFixed(6, BigNumber.ROUND_HALF_FLOOR)} ${token.symbol}.`}
			</ErrorText>
		</Grid>
	);

	const GlobalLimit = () => (
		<Grid container>
			<ErrorText variant="subtitle1">
				<span>{`The current global mint amount limit is `}</span>
				<Tooltip
					arrow
					className={classes.userLimit}
					title="Apply amount"
					placement="top"
					onClick={() => onUserLimitClick(allUsersLimit)}
				>
					<span>{`${toFixedDecimals(token.unscale(allUsersLimit), 6)}`}</span>
				</Tooltip>
				<span> {token.symbol}.</span>
			</ErrorText>
			<ErrorText variant="subtitle1">
				{`Global total mint amount is currently ${token
					.unscale(globalLimit)
					.toFixed(6, BigNumber.ROUND_HALF_FLOOR)} ${token.symbol}.`}
			</ErrorText>
		</Grid>
	);

	if (amount.gt(userLimit)) {
		return userLimit.lt(allUsersLimit) ? <UserLimit /> : <GlobalLimit />;
	}

	if (amount.gt(allUsersLimit)) return <GlobalLimit />;

	return null;
};
