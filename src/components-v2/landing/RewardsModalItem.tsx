import React, { useEffect, useState } from 'react';
import { Grid, Typography, TextField, Button, createStyles, makeStyles, Theme, Tooltip } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react-lite';

export interface RewardsModalItemProps {
	amount: string;
	maxAmount: string;
	display: string;
	value: string;
	symbol: string;
	address: string;
	maxFlag: boolean;
	onChange: (address: string, amount: string) => void;
}

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		claimInputContainer: {
			marginTop: 'auto',
			marginBottom: 'auto',
			textAlign: 'end',
		},
		modalItem: {
			paddingBottom: theme.spacing(2),
			[theme.breakpoints.up('sm')]: {
				width: '505px',
			},
		},
		claimableContainer: {
			paddingTop: '5px',
			overflowY: 'auto',
		},
		currencySymbol: {},
		currencyContainer: {
			position: 'relative',
			top: '-5px',
			overflow: 'hidden',
		},
		currencyValue: {
			marginTop: '-5px',
		},
		maxButton: {
			marginLeft: theme.spacing(1),
		},
		modalField: {
			[theme.breakpoints.up('sm')]: {
				width: '325px',
			},
		},
	}),
);

export const RewardsModalItem = observer(
	(props: RewardsModalItemProps): JSX.Element => {
		const classes = useStyles();
		const { amount, maxAmount, display, value, address, maxFlag, symbol, onChange } = props;

		const [inputAmount, setInputAmount] = useState(amount);
		const [formError, setFormError] = useState(false);
		useEffect(() => {
			onChange(address, inputAmount);
			// Disable Reason: There is no need to handle these deps
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [inputAmount]);

		useEffect(() => {
			if (maxFlag) {
				setInputAmount(maxAmount);
				setFormError(false);
			}
			// Disable Reason: There is no need to handle these deps
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [maxFlag]);

		const handleInputAmount = (event: React.ChangeEvent<HTMLInputElement>): void => {
			const newVal = event.target.value === '.' ? '0.' : event.target.value;
			if (newVal && isNaN(parseFloat(newVal))) {
				return;
			}
			const isValid = new BigNumber(newVal).lte(new BigNumber(maxAmount));
			setFormError(!isValid);
			setInputAmount(newVal);
		};

		const useMaxBalance = () => {
			setInputAmount(maxAmount);
		};

		// ignore 0, or miniscule balances
		const disableInput = parseFloat(maxAmount) === 0 || maxAmount.includes('<');
		const tooltip = disableInput ? 'Cannot claim rewards of less than 1 wei' : '';
		return (
			<Grid
				key={`${symbol}-claim-amount`}
				className={classes.modalItem}
				container
				direction="row"
				justify="space-between"
			>
				<Grid item xs={6} sm={3}>
					<Grid className={classes.claimableContainer}>
						<Typography variant="subtitle2" color="textSecondary" className={classes.currencySymbol}>
							{symbol}
						</Typography>
						<Grid container direction="column" className={classes.currencyContainer}>
							<Typography>{!inputAmount ? 0 : display}</Typography>
							<Typography className={classes.currencyValue} variant="caption" color="textSecondary">
								({value})
							</Typography>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={6} sm={9} className={classes.claimInputContainer}>
					<Tooltip title={tooltip} placement="left" arrow>
						<TextField
							id={`${symbol}-claim-amount`}
							variant="outlined"
							disabled={disableInput}
							value={inputAmount}
							error={formError}
							className={classes.modalField}
							size={window.innerWidth >= 960 ? 'medium' : 'small'}
							onChange={handleInputAmount}
							InputProps={{
								endAdornment:
									window.innerWidth >= 960 && !maxFlag
										? [
												<Button
													key="token-select-btn"
													size="small"
													variant="outlined"
													onClick={useMaxBalance}
													className={classes.maxButton}
												>
													max
												</Button>,
										  ]
										: [],
							}}
						/>
					</Tooltip>
				</Grid>
			</Grid>
		);
	},
);
