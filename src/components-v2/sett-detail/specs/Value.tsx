import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { StyledDivider } from '../styled';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { usdToCurrency } from '../../../mobx/utils/helpers';
import BigNumber from 'bignumber.js';
import { Skeleton } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
	root: {
		marginBottom: 20,
		wordBreak: 'break-all',
	},
	amount: {
		fontSize: 28,
		lineHeight: '1.334',
	},
	currencyIcon: {
		width: 20,
		height: 20,
		marginRight: theme.spacing(1),
	},
}));

interface Props {
	settValue: number;
}

export const Value = observer(
	({ settValue }: Props): JSX.Element => {
		const { uiState } = React.useContext(StoreContext);
		const classes = useStyles();

		// TODO: address this formatting mechanisms in this refactor PR https://github.com/Badger-Finance/v2-ui/pull/707
		// this currency formatting has been battle tested in the <CurrencyDisplay/> component but can be improved
		const currencyValue = usdToCurrency(new BigNumber(settValue), uiState.currency);
		const hasCurrencyIcon = currencyValue?.includes('.png');

		let currencyIcon;
		let displayValue = currencyValue;

		if (currencyValue && hasCurrencyIcon) {
			[currencyIcon, displayValue] = currencyValue.split('.png');
		}

		return (
			<Grid container className={classes.root}>
				<Typography>Value</Typography>
				<StyledDivider />
				{currencyIcon && (
					<img src={`${currencyIcon}.png`} alt={`${currencyIcon} icon`} className={classes.currencyIcon} />
				)}
				<Typography className={classes.amount}>
					{displayValue ?? <Skeleton width={209} height={37} />}
				</Typography>
			</Grid>
		);
	},
);
