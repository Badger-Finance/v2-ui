import React from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { Divider, Grid, Typography } from '@material-ui/core';
import { formatStrategyFee } from '../../../utils/componentHelpers';
import { StoreContext } from '../../../mobx/store-context';
import { MAX_FEE } from 'config/constants';
import { Sett } from '@badger-dao/sdk';
import { BigNumber } from 'ethers';
import { formatBalanceString } from 'mobx/utils/helpers';

const useStyles = makeStyles((theme) => ({
	specName: {
		fontSize: 12,
		lineHeight: '1.66',
	},
	divider: {
		width: '100%',
		marginBottom: theme.spacing(1),
	},
	titleContainer: {
		display: 'flex',
		alignItems: 'center',
	},
}));

interface Props {
	sett: Sett;
	fee: number;
	amount: BigNumber;
}

export const SettWithdrawFee = observer(
	({ sett, fee, amount }: Props): JSX.Element => {
		const { setts } = React.useContext(StoreContext);
		const classes = useStyles();

		const depositToken = setts.getToken(sett.underlyingToken);
		const depositTokenSymbol = depositToken?.symbol || '';
		const depositTokenDecimals = depositToken?.decimals || 18;

		const withdrawAmount = BigNumber.from(amount).mul(sett.pricePerFullShare);
		const withdrawalFee = withdrawAmount.mul(fee).div(MAX_FEE);
		const amountAfterFee = BigNumber.from(withdrawAmount).sub(withdrawalFee);

		return (
			<Grid container>
				<Typography>Fees</Typography>
				<Divider className={classes.divider} />
				<Grid container justify="space-between">
					<Typography className={classes.specName} color="textSecondary" display="inline">
						Converted Amount
					</Typography>
					<Typography display="inline" variant="subtitle2">
						{`${formatBalanceString(withdrawAmount, depositTokenDecimals)} ${depositTokenSymbol}`}
					</Typography>
				</Grid>
				<Grid container justify="space-between">
					<Typography className={classes.specName} color="textSecondary" display="inline">
						{`Estimated Fee (${formatStrategyFee(fee)})`}
					</Typography>
					<Typography display="inline" variant="subtitle2">
						{`${formatBalanceString(withdrawalFee, depositTokenDecimals)} ${depositTokenSymbol}`}
					</Typography>
				</Grid>
				<Grid container justify="space-between">
					<Typography className={classes.specName} color="textSecondary" display="inline">
						You will receive
					</Typography>
					<Typography display="inline" variant="subtitle2">
						{`${formatBalanceString(amountAfterFee, depositTokenDecimals)} ${depositTokenSymbol}`}
					</Typography>
				</Grid>
			</Grid>
		);
	},
);
