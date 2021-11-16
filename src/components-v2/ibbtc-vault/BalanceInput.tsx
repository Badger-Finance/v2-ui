import React, { useContext, useState, Fragment, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react-lite';
import { Box, ButtonBase, Divider, Grid, TextField, Typography } from '@material-ui/core';
import { StoreContext } from '../../mobx/store-context';
import { inCurrency } from '../../mobx/utils/helpers';
import { useNumericInput } from '../../utils/useNumericInput';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { Currency } from '../../config/enums/currency.enum';
import { makeStyles } from '@material-ui/core/styles';

interface Props {
	tokenBalance: TokenBalance;
	onChange: (balance: BigNumber) => void;
}

const useStyles = makeStyles((theme) => ({
	percentagesContainer: {
		display: 'flex',
		[theme.breakpoints.up('sm')]: {
			justifyContent: 'flex-end',
		},
	},
	input: {
		textAlign: 'end',
	},
	balances: {
		marginTop: theme.spacing(0.5),
	},
}));

const BalanceInput = ({ tokenBalance, onChange }: Props) => {
	const { balance, price, token } = tokenBalance;
	const { user } = useContext(StoreContext);
	const [inputValue, setInputValue] = useState(balance.toString());
	const { inputProps, onValidChange } = useNumericInput(12);
	const classes = useStyles();

	const handleInputChange = (amount: string) => {
		setInputValue(amount);
		onChange(TokenBalance.fromBalance(tokenBalance, amount).tokenBalance);
	};

	const handleApplyPercentage = (percentage: number) => {
		const referenceToken = user.getTokenBalance(tokenBalance.token.address);
		setInputValue(referenceToken.balance.dividedBy(percentage / 100).toString());
		onChange(referenceToken.tokenBalance.dividedBy(percentage));
	};

	const percentages = (
		<Box className={classes.percentagesContainer}>
			{[25, 50, 75, 100].map((percentage, index, total) => (
				<Fragment key={`${percentage}%_${index}`}>
					<ButtonBase onClick={() => handleApplyPercentage(percentage)}>
						<Typography variant="caption">{`${percentage}%`}</Typography>
					</ButtonBase>
					{index !== total.length - 1 && <Divider orientation="vertical" variant="middle" flexItem />}
				</Fragment>
			))}
		</Box>
	);

	useEffect(() => {
		setInputValue(tokenBalance.balance.toString());
	}, [tokenBalance]);

	return (
		<Grid container>
			<Grid item xs={12} sm={3}>
				<Typography variant="subtitle2">{token.symbol}</Typography>
				<Typography variant="caption" color="textSecondary">
					{inCurrency(price, Currency.USD)}
				</Typography>
			</Grid>
			<Grid item container xs={12} sm={9}>
				<Box width="100%">
					<TextField
						fullWidth
						inputProps={inputProps}
						className={classes.input}
						variant="outlined"
						value={inputValue}
						onChange={onValidChange(handleInputChange)}
					/>
				</Box>
				<Grid container alignItems="center" justify="space-between" className={classes.balances}>
					<Box>
						<Typography variant="caption">{`BALANCE: ${tokenBalance.balanceDisplay(6)}`}</Typography>
					</Box>
					{percentages}
				</Grid>
				<Grid container>
					<Typography variant="caption" color="textSecondary">{`(${tokenBalance.balanceValueDisplay(
						Currency.USD,
					)})`}</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default observer(BalanceInput);
