import React, { useState, Fragment, useEffect } from 'react';
import { Box, ButtonBase, Divider, Grid, Typography } from '@material-ui/core';
import { useNumericInput } from '../../utils/useNumericInput';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { makeStyles } from '@material-ui/core/styles';
import { AmountTextField } from 'components-v2/common/dialogs/styled';

interface Props {
	tokenBalance: TokenBalance;
	onChange: (balance: TokenBalance) => void;
}

const useStyles = makeStyles((theme) => ({
	inputContainer: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},
	percentagesContainer: {
		display: 'flex',
		[theme.breakpoints.up('sm')]: {
			justifyContent: 'flex-end',
		},
	},
	input: {
		textAlign: 'end',
		borderRadius: '10px',
	},
	balances: {
		marginTop: theme.spacing(1),
	},
}));

const BondInput = ({ tokenBalance, onChange }: Props): JSX.Element => {
	const { balance, price, token } = tokenBalance;
	const [inputValue, setInputValue] = useState('0');
	const { inputProps, onValidChange } = useNumericInput({
		fontSize: '16px',
		lineHeight: '25px',
		fontWeight: 'bold',
		letterSpacing: '0.25px',
	});
	const classes = useStyles();

	const handleInputChange = (amount: string) => {
		setInputValue(amount);
		onChange(TokenBalance.fromBalance(tokenBalance, amount || '0'));
	};

	const handleApplyPercentage = (percentage: number) => {
		setInputValue(balance.multipliedBy(percentage / 100).toString());
		onChange(
			new TokenBalance(token, tokenBalance.tokenBalance.multipliedBy(percentage).dividedToIntegerBy(100), price),
		);
	};

	return (
		<div className={classes.inputContainer}>
			<AmountTextField
				fullWidth
				inputProps={inputProps}
				className={classes.input}
				variant="outlined"
				value={inputValue}
				onChange={onValidChange(handleInputChange)}
			/>
			<Grid container alignItems="center" justifyContent="space-between" className={classes.balances}>
				<Typography variant="caption">{`BALANCE: ${tokenBalance.balanceDisplay(6)}`}</Typography>
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
			</Grid>
		</div>
	);
};

export default BondInput;
