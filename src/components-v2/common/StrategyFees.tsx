import React from 'react';
import { StrategyConfig } from '../../mobx/model/strategies/strategy-config';
import { StrategyFee, userReadableFeeNames } from '../../mobx/model/system-config/stategy-fees';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { formatStrategyFee } from '../../utils/componentHelpers';
import { getStrategyFee } from 'mobx/utils/fees';
import { Vault } from '@badger-dao/sdk';
import { FeeConfig } from 'mobx/model/fees/fee-config';

const useStyles = makeStyles({
	specName: {
		fontSize: 12,
		lineHeight: '1.66',
	},
});

interface Props {
	vault: Vault;
	fees: FeeConfig;
	showEmpty?: boolean;
}

export const StrategyFees = ({ vault, fees, showEmpty = false }: Props): JSX.Element => {
	const classes = useStyles();
	const feeKeys = Object.keys(fees) as StrategyFee[];

	const feeItems = feeKeys.map((key) => {
		const fee = getStrategyFee(vault, key, fees);

		if (!fee) {
			return null;
		}

		if (fee === 0 && !showEmpty) {
			return null;
		}

		return (
			<Grid key={key} container justifyContent="space-between">
				<Typography className={classes.specName} color="textSecondary" display="inline">
					{userReadableFeeNames[key]}
				</Typography>
				<Typography display="inline" variant="subtitle2">
					{formatStrategyFee(fee)}
				</Typography>
			</Grid>
		);
	});

	return <Grid container>{feeItems}</Grid>;
};
