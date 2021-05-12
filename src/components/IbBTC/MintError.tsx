import React from 'react';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { Fade, Grid, makeStyles } from '@material-ui/core';

import { TokenModel } from 'mobx/model';
import { StoreContext } from 'mobx/store-context';
import { ErrorText } from './Common';

interface Props {
	token: TokenModel;
	amount: BigNumber;
	onUserLimitClick: (limit: BigNumber) => void;
}

const useStyles = makeStyles(() => ({
	userLimit: {
		cursor: 'pointer',
	},
}));

export const MintError = observer(({ token, amount, onUserLimitClick }: Props): JSX.Element | null => {
	const store = React.useContext(StoreContext);
	const classes = useStyles();
	const { bouncerProof } = store.user;
	const { ibBTC, mintLimits } = store.ibBTCStore;
	const tokenLimit = mintLimits?.get(token.symbol);

	if (!tokenLimit || !bouncerProof) {
		return null;
	}

	const { userLimit, individualLimit, globalLimit, allUsersLimit } = tokenLimit;

	if (amount.gt(userLimit)) {
		return (
			<Fade in>
				<Grid container>
					<ErrorText
						variant="subtitle1"
						className={classes.userLimit}
						onClick={() => onUserLimitClick(userLimit)}
					>
						{`Your current mint amount limit is ${ibBTC
							.unscale(userLimit)
							.toFixed(6, BigNumber.ROUND_HALF_FLOOR)}
					${ibBTC.symbol}.`}
					</ErrorText>
					<ErrorText variant="subtitle1">
						{`Individual total mint amount limit is currently ${ibBTC
							.unscale(individualLimit)
							.toFixed(6, BigNumber.ROUND_HALF_FLOOR)} ${ibBTC.symbol}.`}
					</ErrorText>
				</Grid>
			</Fade>
		);
	}

	if (amount.gt(allUsersLimit)) {
		return (
			<Fade in>
				<Grid container>
					<ErrorText
						variant="subtitle1"
						className={classes.userLimit}
						onClick={() => onUserLimitClick(allUsersLimit)}
					>
						{`The current global mint amount limit is ${ibBTC
							.unscale(allUsersLimit)
							.toFixed(6, BigNumber.ROUND_HALF_FLOOR)} ${ibBTC.symbol}.`}
					</ErrorText>
					<ErrorText variant="subtitle1">
						{`Global total mint amount is currently ${ibBTC
							.unscale(globalLimit)
							.toFixed(6, BigNumber.ROUND_HALF_FLOOR)} ${ibBTC.symbol}.`}
					</ErrorText>
				</Grid>
			</Fade>
		);
	}

	return null;
});
