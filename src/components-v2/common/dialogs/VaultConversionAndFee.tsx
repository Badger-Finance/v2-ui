import { formatBalance, VaultDTO } from '@badger-dao/sdk';
import { Divider, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MAX_FEE } from 'config/constants';
import { BigNumber, BigNumberish } from 'ethers';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { StrategyFee } from '../../../mobx/model/system-config/stategy-fees';
import { getStrategyFee } from '../../../mobx/utils/fees';
import { formatStrategyFee } from '../../../utils/componentHelpers';

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
	vault: VaultDTO;
	amount: BigNumberish;
}

export const VaultConversionAndFee = observer(({ vault, amount }: Props): JSX.Element => {
	const { vaults } = React.useContext(StoreContext);
	const classes = useStyles();

	const withdrawFee = getStrategyFee(vault, StrategyFee.withdraw);
	const depositToken = vaults.getToken(vault.underlyingToken);
	const depositTokenSymbol = depositToken?.symbol || '';
	const depositTokenDecimals = depositToken?.decimals || 18;

	const withdrawAmount = BigNumber.from(amount).mul(vault.pricePerFullShare);
	const withdrawalFee = withdrawAmount.mul(withdrawFee).div(MAX_FEE);
	const amountAfterFee = BigNumber.from(withdrawAmount).sub(withdrawalFee);

	return (
		<Grid container>
			<Typography>Fees</Typography>
			<Divider className={classes.divider} />
			<Grid container justifyContent="space-between">
				<Typography className={classes.specName} color="textSecondary" display="inline">
					Converted Amount
				</Typography>
				<Typography display="inline" variant="subtitle2">
					{`${formatBalance(withdrawAmount, depositTokenDecimals)} ${depositTokenSymbol}`}
				</Typography>
			</Grid>
			<Grid container justifyContent="space-between">
				<Typography className={classes.specName} color="textSecondary" display="inline">
					{`Estimated Fee (${formatStrategyFee(withdrawFee)})`}
				</Typography>
				<Typography display="inline" variant="subtitle2">
					{`${formatBalance(withdrawalFee, depositTokenDecimals)} ${depositTokenSymbol}`}
				</Typography>
			</Grid>
			<Grid container justifyContent="space-between">
				<Typography className={classes.specName} color="textSecondary" display="inline">
					You will receive
				</Typography>
				<Typography display="inline" variant="subtitle2">
					{`${formatBalance(amountAfterFee, depositTokenDecimals)} ${depositTokenSymbol}`}
				</Typography>
			</Grid>
		</Grid>
	);
});
