import React from 'react';
import { Grid, makeStyles, Tooltip } from '@material-ui/core';
import { ErrorText } from './Common';
import { IbbtcOptionToken } from '../../mobx/model/tokens/ibbtc-option-token';
import { MintLimits } from '../../mobx/model/strategies/mint-limits';
import { BigNumber } from 'ethers';
import { formatBalanceString } from 'mobx/utils/helpers';

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
					enterTouchDelay={0}
					arrow
					className={classes.userLimit}
					title="Apply amount"
					placement="top"
					onClick={() => onUserLimitClick(userLimit)}
				>
					<span>{`${formatBalanceString(token.unscale(userLimit), 6)} `}</span>
				</Tooltip>
				<span>{`${token.symbol}.`}</span>
			</ErrorText>
			<ErrorText variant="subtitle1">
				{`Individual total mint amount limit is currently ${formatBalanceString(token
					.unscale(individualLimit), token.decimals)} ${token.symbol}.`}
			</ErrorText>
		</Grid>
	);

	const GlobalLimit = () => (
		<Grid container>
			<ErrorText variant="subtitle1">
				<span>{`The current global mint amount limit is `}</span>
				<Tooltip
					enterTouchDelay={0}
					arrow
					className={classes.userLimit}
					title="Apply amount"
					placement="top"
					onClick={() => onUserLimitClick(allUsersLimit)}
				>
					<span>{`${formatBalanceString(token.unscale(allUsersLimit), 6)}`}</span>
				</Tooltip>
				<span> {token.symbol}.</span>
			</ErrorText>
			<ErrorText variant="subtitle1">
				{`Global total mint amount is currently ${formatBalanceString(token
					.unscale(globalLimit), 6)} ${token.symbol}.`}
			</ErrorText>
		</Grid>
	);

	if (amount.gt(userLimit)) {
		return userLimit.lt(allUsersLimit) ? <UserLimit /> : <GlobalLimit />;
	}

	if (amount.gt(allUsersLimit)) return <GlobalLimit />;

	return null;
};
