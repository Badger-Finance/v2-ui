import React from 'react';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { makeStyles } from '@material-ui/core/styles';
import { Divider, Grid, Typography } from '@material-ui/core';
import { formatStrategyFee } from '../../../utils/componentHelpers';
import { StoreContext } from '../../../mobx/store-context';
import { MAX_FEE } from 'config/constants';
import { Vault } from '@badger-dao/sdk';
import { getStrategyFee } from '../../../mobx/utils/fees';
import { StrategyFee } from '../../../mobx/model/system-config/stategy-fees';

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
	sett: Vault;
	amount: BigNumber.Value;
}

const formatAmount = (amount: BigNumber.Value, decimals: number) => {
	return new BigNumber(amount).decimalPlaces(decimals, BigNumber.ROUND_HALF_FLOOR).toString();
};

export const SettConversionAndFee = observer(({ sett, amount }: Props): JSX.Element => {
	const {
		setts,
		network: { network },
	} = React.useContext(StoreContext);
	const classes = useStyles();

	const withdrawFee = getStrategyFee(sett, StrategyFee.withdraw, network.strategies[sett.vaultToken]);
	const depositToken = setts.getToken(sett.underlyingToken);
	const depositTokenSymbol = depositToken?.symbol || '';
	const depositTokenDecimals = depositToken?.decimals || 18;

	const withdrawAmount = new BigNumber(amount).multipliedBy(sett.pricePerFullShare);
	const withdrawalFee = withdrawAmount.multipliedBy(withdrawFee).dividedBy(MAX_FEE);
	const amountAfterFee = new BigNumber(withdrawAmount).minus(withdrawalFee);

	return (
		<Grid container>
			<Typography>Fees</Typography>
			<Divider className={classes.divider} />
			<Grid container justifyContent="space-between">
				<Typography className={classes.specName} color="textSecondary" display="inline">
					Converted Amount
				</Typography>
				<Typography display="inline" variant="subtitle2">
					{`${formatAmount(withdrawAmount, depositTokenDecimals)} ${depositTokenSymbol}`}
				</Typography>
			</Grid>
			<Grid container justifyContent="space-between">
				<Typography className={classes.specName} color="textSecondary" display="inline">
					{`Estimated Fee (${formatStrategyFee(withdrawFee)})`}
				</Typography>
				<Typography display="inline" variant="subtitle2">
					{`${formatAmount(withdrawalFee, depositTokenDecimals)} ${depositTokenSymbol}`}
				</Typography>
			</Grid>
			<Grid container justifyContent="space-between">
				<Typography className={classes.specName} color="textSecondary" display="inline">
					You will receive
				</Typography>
				<Typography display="inline" variant="subtitle2">
					{`${formatAmount(amountAfterFee, depositTokenDecimals)} ${depositTokenSymbol}`}
				</Typography>
			</Grid>
		</Grid>
	);
});
