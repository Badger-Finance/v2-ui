import React from 'react';
import { VaultDTO } from '@badger-dao/sdk';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { inCurrency } from '../../mobx/utils/helpers';
import BigNumber from 'bignumber.js';
import { Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
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
	vault: VaultDTO;
}

const VaultDepositedAssets = ({ vault }: Props): JSX.Element => {
	const { uiState } = React.useContext(StoreContext);
	const classes = useStyles();
	const currencyValue = inCurrency(new BigNumber(vault.value), uiState.currency);
	const hasCurrencyIcon = currencyValue?.includes('.png');

	let currencyIcon;
	let displayValue = currencyValue;

	if (currencyValue && hasCurrencyIcon) {
		[currencyIcon, displayValue] = currencyValue.split('.png');
	}

	return (
		<>
			{currencyIcon && (
				<img src={`${currencyIcon}.png`} alt={`${currencyIcon} icon`} className={classes.currencyIcon} />
			)}
			<Typography className={classes.amount}>{displayValue ?? <Skeleton width={209} height={37} />}</Typography>
		</>
	);
};

export default observer(VaultDepositedAssets);
