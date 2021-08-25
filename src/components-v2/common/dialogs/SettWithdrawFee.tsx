import React from 'react';
import { observer } from 'mobx-react-lite';
import { Sett } from '../../../mobx/model/setts/sett';
import BigNumber from 'bignumber.js';
import { makeStyles } from '@material-ui/core/styles';
import { Divider, Grid, Typography } from '@material-ui/core';
import { formatStrategyFee } from '../../../utils/componentHelpers';
import { StoreContext } from '../../../mobx/store-context';

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
	fee: BigNumber;
	amount: BigNumber.Value;
}

const formatAmount = (amount: BigNumber.Value, decimals: number) => {
	return new BigNumber(amount).decimalPlaces(decimals, BigNumber.ROUND_HALF_FLOOR).toString();
};

export const SettWithdrawFee = observer(
	({ sett, fee, amount }: Props): JSX.Element => {
		const { setts } = React.useContext(StoreContext);
		const classes = useStyles();

		const depositToken = setts.getToken(sett.underlyingToken);
		const depositTokenSymbol = depositToken?.symbol || '';
		const depositTokenDecimals = depositToken?.decimals || 18;

		const withdrawAmount = new BigNumber(amount).multipliedBy(sett.ppfs);
		const withdrawalFee = fee.div(1000).multipliedBy(withdrawAmount);
		const amountAfterFee = new BigNumber(withdrawAmount).minus(withdrawalFee);

		return (
			<Grid container>
				<Typography>Fees</Typography>
				<Divider className={classes.divider} />
				<Grid container justify="space-between">
					<Typography className={classes.specName} color="textSecondary" display="inline">
						Converted Amount
					</Typography>
					<Typography display="inline" variant="subtitle2">
						{`${formatAmount(withdrawAmount, depositTokenDecimals)} ${depositTokenSymbol}`}
					</Typography>
				</Grid>
				<Grid container justify="space-between">
					<Typography className={classes.specName} color="textSecondary" display="inline">
						{`Estimated Fee (${formatStrategyFee(fee)})`}
					</Typography>
					<Typography display="inline" variant="subtitle2">
						{`${formatAmount(withdrawalFee, depositTokenDecimals)} ${depositTokenSymbol}`}
					</Typography>
				</Grid>
				<Grid container justify="space-between">
					<Typography className={classes.specName} color="textSecondary" display="inline">
						You will receive
					</Typography>
					<Typography display="inline" variant="subtitle2">
						{`${formatAmount(amountAfterFee, depositTokenDecimals)} ${depositTokenSymbol}`}
					</Typography>
				</Grid>
			</Grid>
		);
	},
);
