import React from 'react';
import { StrategyConfig } from '../../mobx/model/strategies/strategy-config';
import { StrategyFee } from '../../mobx/model/system-config/stategy-fees';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { formatStrategyFee } from '../../utils/componentHelpers';

const useStyles = makeStyles({
	specName: {
		fontSize: 12,
		lineHeight: '1.66',
	},
});

interface Props {
	strategy: StrategyConfig;
	showEmpty?: boolean;
}

export const StrategyFees = ({ strategy, showEmpty = false }: Props): JSX.Element => {
	const classes = useStyles();
	const fees = strategy.fees;
	const feeKeys = Object.keys(fees) as StrategyFee[];

	const feeItems = feeKeys.map((key) => {
		const fee = fees[key];

		if (!fee) {
			return null;
		}

		if (fee.isZero() && !showEmpty) {
			return null;
		}

		return (
			<Grid key={key} container justify="space-between">
				<Typography className={classes.specName} color="textSecondary" display="inline">
					{key}
				</Typography>
				<Typography display="inline" variant="subtitle2">
					{formatStrategyFee(fee)}
				</Typography>
			</Grid>
		);
	});

	return <Grid container>{feeItems}</Grid>;
};
