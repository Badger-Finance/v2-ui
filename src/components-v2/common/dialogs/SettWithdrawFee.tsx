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
	withdrawAmount: BigNumber.Value;
}

export const SettWithdrawFee = observer(
	({ sett, fee, withdrawAmount }: Props): JSX.Element => {
		const { setts } = React.useContext(StoreContext);

		const classes = useStyles();
		const depositToken = setts.getToken(sett.underlyingToken);
		const symbol = depositToken?.symbol || '';
		const decimals = depositToken?.decimals || 18;

		const withdrawalFee = fee.div(100).multipliedBy(withdrawAmount);
		const amountAfterFee = new BigNumber(withdrawAmount).minus(withdrawalFee);

		return (
			<Grid container>
				<Typography>Fees</Typography>
				<Divider className={classes.divider} />
				<Grid container justify="space-between">
					<Typography className={classes.specName} color="textSecondary" display="inline">
						Sett Withdraw Fee (%)
					</Typography>
					<Typography display="inline" variant="subtitle2">
						{formatStrategyFee(fee)}
					</Typography>
				</Grid>
				<Grid container justify="space-between">
					<Typography className={classes.specName} color="textSecondary" display="inline">
						Estimated Fee
					</Typography>
					<Typography display="inline" variant="subtitle2">
						{`${withdrawalFee.decimalPlaces(decimals, BigNumber.ROUND_HALF_FLOOR).toString()} ${symbol}`}
					</Typography>
				</Grid>
				<Grid container justify="space-between">
					<Typography className={classes.specName} color="textSecondary" display="inline">
						Withdraw After Fee
					</Typography>
					<Typography display="inline" variant="subtitle2">
						{`${amountAfterFee.decimalPlaces(decimals, BigNumber.ROUND_HALF_FLOOR)} ${symbol}`}
					</Typography>
				</Grid>
			</Grid>
		);
	},
);
