import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { Button, DialogContent, TextField, DialogActions, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { TokenBalance } from 'mobx/model/token-balance';
import { SettModalProps } from './VaultDeposit';
import { StrategyInfo } from './StrategyInfo';
import { PercentageSelector } from 'components-v2/common/PercentageSelector';
import { useNumericInput } from 'utils/useNumericInput';
import { UnderlyingAsset } from './UnderlyingAsset';
import { DepositedAsset } from './DepositedAsset';

const useStyles = makeStyles((theme) => ({
	button: {
		marginBottom: theme.spacing(1),
	},
	field: {
		margin: theme.spacing(1, 0, 1),
	},
	skeleton: {
		display: 'inline-flex',
		width: '25%',
		paddingLeft: theme.spacing(1),
	},
	balanceInformation: {
		marginBottom: theme.spacing(1),
		[theme.breakpoints.only('xs')]: {
			textAlign: 'center',
		},
	},
	percentageContainer: {
		marginBottom: theme.spacing(1),
		textAlign: 'center',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'end',
		},
	},
}));

export const VaultWithdraw = observer((props: SettModalProps) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { sett, badgerSett } = props;
	const [amount, setAmount] = useState<string>();
	const [percentage, setPercentage] = useState<number>();
	const { type, pattern, onValidChange } = useNumericInput();

	const {
		wallet: { connectedAddress, network },
		user: { settBalances },
		contracts,
	} = store;

	const userBalance = settBalances[badgerSett.vaultToken.address];
	const canDeposit = connectedAddress && !!amount && userBalance.balance.gt(0);

	const handlePercentageChange = (percent: number) => {
		setPercentage(percent);
		setAmount(userBalance.scaledBalanceDisplay(percent));
	};

	const handleSubmit = () => {
		if (!amount) return;
		const withdrawBalance = TokenBalance.fromBalance(userBalance, amount);
		contracts.withdraw(sett, badgerSett, userBalance, withdrawBalance).then();
	};

	return (
		<>
			<DialogContent>
				<Grid container spacing={1}>
					<Grid item container xs={12} sm={7}>
						<Grid item xs={12} className={classes.balanceInformation}>
							<UnderlyingAsset sett={sett} badgerSett={badgerSett} />
						</Grid>
						<Grid item xs={12} className={classes.balanceInformation}>
							<DepositedAsset sett={sett} badgerSett={badgerSett} />
						</Grid>
					</Grid>
					<Grid item xs={12} sm={5} className={classes.percentageContainer}>
						<PercentageSelector
							size="small"
							selectedOption={percentage}
							options={[25, 50, 75, 100]}
							disabled={!connectedAddress}
							onChange={handlePercentageChange}
						/>
					</Grid>
				</Grid>
				<StrategyInfo vaultAddress={badgerSett.vaultToken.address} network={network} />
				<TextField
					fullWidth
					variant="outlined"
					placeholder="Type an amount to withdraw"
					disabled={!connectedAddress}
					className={classes.field}
					type={type}
					inputProps={{ pattern }}
					value={amount || ''}
					onChange={onValidChange(setAmount)}
				/>
			</DialogContent>
			<DialogActions>
				<Button
					aria-label="Withdraw"
					size="large"
					disabled={!canDeposit}
					onClick={handleSubmit}
					variant="contained"
					color="primary"
					fullWidth
					className={classes.button}
				>
					Withdraw
				</Button>
			</DialogActions>
		</>
	);
});
