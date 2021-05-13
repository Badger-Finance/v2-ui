import React from 'react';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { Fade, Grid, makeStyles, Tooltip } from '@material-ui/core';

import { MintLimits, TokenModel } from 'mobx/model';
import { StoreContext } from 'mobx/store-context';
import { ErrorText } from './Common';
import { formatTokens } from '../../mobx/utils/helpers';

interface Props {
	token: TokenModel;
	amount: BigNumber;
	limits: MintLimits;
	onUserLimitClick: (limit: BigNumber) => void;
}

const useStyles = makeStyles(() => ({
	userLimit: {
		cursor: 'pointer',
	},
}));

export const MintError = observer(({ token, amount, limits, onUserLimitClick }: Props): JSX.Element | null => {
	const store = React.useContext(StoreContext);
	const classes = useStyles();
	const { bouncerProof } = store.user;

	if (!bouncerProof) {
		return null;
	}

	const { userLimit, individualLimit, globalLimit, allUsersLimit } = limits;

	const UserLimit = () => (
		<Fade in>
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
						<span>{`${formatTokens(token.unscale(userLimit), 6)} `}</span>
					</Tooltip>
					<span>{`${token.symbol}.`}</span>
				</ErrorText>
				<ErrorText variant="subtitle1">
					{`Individual total mint amount limit is currently ${token
						.unscale(individualLimit)
						.toFixed(6, BigNumber.ROUND_HALF_FLOOR)} ${token.symbol}.`}
				</ErrorText>
			</Grid>
		</Fade>
	);

	const GlobalLimit = () => (
		<Fade in>
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
						<span>{`${formatTokens(token.unscale(allUsersLimit), 6)}`}</span>
					</Tooltip>
					<span> {token.symbol}.</span>
				</ErrorText>
				<ErrorText variant="subtitle1">
					{`Global total mint amount is currently ${token
						.unscale(globalLimit)
						.toFixed(6, BigNumber.ROUND_HALF_FLOOR)} ${token.symbol}.`}
				</ErrorText>
			</Grid>
		</Fade>
	);

	if (amount.gt(userLimit)) {
		return userLimit.lt(allUsersLimit) ? <UserLimit /> : <GlobalLimit />;
	}

	if (amount.gt(allUsersLimit)) return <GlobalLimit />;

	return null;
});
