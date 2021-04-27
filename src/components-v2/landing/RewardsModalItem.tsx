import React, { useEffect, useState } from 'react';
import { Grid, Typography, TextField, Button, createStyles, makeStyles, Theme } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react-lite';

export interface RewardsModalItemProps {
	amount: string;
	symbol: string;
	address: string;
	maxFlag: boolean;
	onChange: (address: string, amount: string) => void;
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		claimInput: {
			[theme.breakpoints.up('md')]: { paddingLeft: theme.spacing(6) },
			[theme.breakpoints.down('md')]: { paddingLeft: theme.spacing(2), maxWidth: '66%' },
		},
		modalItem: {
			paddingBottom: theme.spacing(2),
		},
	}),
);

export const RewardsModalItem = observer(
	(props: RewardsModalItemProps): JSX.Element => {
		const classes = useStyles();
		const { amount, address, maxFlag, symbol, onChange } = props;

		const [inputAmount, setInputAmount] = useState(amount);
		const [formError, setFormError] = useState(false);
		useEffect(() => {
			if (onChange) {
				onChange(address, inputAmount);
			}
			// Disable Reason: There is no need to handle these deps
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [inputAmount]);

		useEffect(() => {
			setInputAmount(amount);
			// Disable Reason: There is no need to handle these deps
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [maxFlag]);

		const handleInputAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
			const newVal = event.target.value === '.' ? '0.' : event.target.value;
			if (isNaN(Number(newVal))) return;
			new BigNumber(newVal).gt(new BigNumber(amount)) ? setFormError(true) : setFormError(false);
			setInputAmount(newVal);
		};

		const useMaxBalance = () => {
			setInputAmount(amount);
		};

		return (
			<Grid
				key={`${symbol}-claim-amount`}
				className={classes.modalItem}
				container
				direction="row"
				justify="space-between"
			>
				<Grid>
					<Typography>{amount}</Typography>
					<Typography variant="subtitle2" color="textSecondary">
						{symbol}
					</Typography>
				</Grid>
				<TextField
					id={`${symbol}-claim-amount`}
					className={classes.claimInput}
					variant="outlined"
					value={inputAmount}
					error={formError}
					size={window.innerWidth >= 960 ? 'medium' : 'small'}
					onChange={handleInputAmount}
					InputProps={{
						endAdornment: [
							<Button key="token-select-btn" size="small" variant="outlined" onClick={useMaxBalance}>
								max
							</Button>,
						],
					}}
				/>
			</Grid>
		);
	},
);
