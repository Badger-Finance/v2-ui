import React from 'react';
import BigNumber from 'bignumber.js';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';

interface Props {
	calculatedSlippage: BigNumber;
	limitSlippage: number;
}

const useStyles = makeStyles((theme) => ({
	positiveSlippage: {
		color: '#3DDB39',
	},
	positiveSlippageIcon: {
		marginRight: theme.spacing(1),
	},
	negativeSlippage: {
		color: '#FF0101',
	},
}));

const SlippageMessage = ({ calculatedSlippage, limitSlippage }: Props): JSX.Element => {
	const classes = useStyles();

	if (calculatedSlippage.isNegative()) {
		return (
			<Box display="flex" alignItems="center">
				<img
					className={classes.positiveSlippageIcon}
					src="/assets/icons/positive-slippage.svg"
					alt="positive slippage icon"
				/>
				<Typography
					variant="subtitle2"
					className={classes.positiveSlippage}
				>{`Slippage bonus (incl. pricing): ${calculatedSlippage
					.absoluteValue()
					.decimalPlaces(3)}%`}</Typography>
			</Box>
		);
	}

	if (calculatedSlippage.isGreaterThan(limitSlippage)) {
		return (
			<Typography
				variant="subtitle2"
				className={classes.negativeSlippage}
			>{`Slippage higher than expected (incl. pricing): ${calculatedSlippage.decimalPlaces(6)}%`}</Typography>
		);
	}

	return (
		<Typography variant="subtitle2">{`Estiamated slippage (incl. pricing): ${calculatedSlippage.decimalPlaces(
			3,
		)}%`}</Typography>
	);
};

export default SlippageMessage;
