import React, {useContext, useState} from "react";
import TableHeader from '../../components/Collection/Setts/TableHeader';
import { observer } from "mobx-react-lite";
import { List, makeStyles, Typography } from "@material-ui/core";
import { StoreContext } from "mobx/store-context";
import { Loader } from "components/Loader";
import _ from 'lodash';
import SettListItem from "components-v2/common/SettListItem";
import BigNumber from "bignumber.js";
import {usdToCurrency} from "../../mobx/utils/helpers";
import {
	formatBalance,
	formatBalanceUnderlying, formatBalanceValue, formatGeyserBalance, formatGeyserBalanceValue,
	formatPrice,
	formatTokenBalanceValue
} from "../../mobx/reducers/statsReducers";
import {Geyser, Vault} from "../../mobx/model";
import SettDialog from "../../components/Collection/Setts/SettDialog";

const useStyles = makeStyles((theme) => ({
	list: {
		width: '100%',
		borderRadius: theme.shape.borderRadius,
		overflow: 'hidden',
		background: `${theme.palette.background.paper}`,
		padding: 0,
		boxShadow: theme.shadows[1],
		marginBottom: theme.spacing(1),
	},
	listItem: {
		padding: 0,
		'&:last-child div': {
			borderBottom: 0,
		},
	},
	before: {
		marginTop: theme.spacing(3),
		width: '100%',
	},
	header: {
		padding: theme.spacing(0, -2, 0, 0),
	},
	hiddenMobile: {
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
	chip: {
		marginLeft: theme.spacing(1),
		padding: 0,
	},
	title: {
		padding: theme.spacing(2, 2, 2),
	},
	settListContainer: {
		marginTop: theme.spacing(6),
		marginBottom: theme.spacing(12),
	},
}));

interface Props {
	totalValue: BigNumber;
	isUsd: boolean;
}

const SettListV2 = observer((props: Props) => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const {
		setts: {settList},
		uiState: {currency, period, hideZeroBal, stats},
		contracts: {vaults},
	} = store;

	const {totalValue, isUsd} = props;

	const isError = () => {
		if (settList === null)
			return (<Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>);
		else if (!settList)
				return (<Loader/>);
		else
			return undefined;
	}


	// TODO: add vault symbol image to SettDialog
	const [dialogProps, setDialogProps] = useState({open: false, vault: undefined as any, sett: undefined as any});
	const onOpen = (vault: Vault, sett: any) => setDialogProps({vault: vault, open: true, sett: sett});
	const onClose = () => setDialogProps({...dialogProps, open: false});

	const getSettListDisplay = (): JSX.Element => {
		const error = isError();
		if (error) return error;

		return (
			<>
				{settList!.map((sett) => {
					const vault: Vault = vaults[sett.vaultToken.toLowerCase()];
					return <SettListItem sett={sett} key={sett.name} currency={currency} onOpen={() => onOpen(vault, sett)}/>;
				})}
			</>
		);
	};

	const getWalletListDisplay = (): (JSX.Element | undefined)[] => {
		const error = isError();
		if (error) return [error];

		return (
			settList!.map((sett) => {
				const vault: Vault = vaults[sett.vaultToken.toLowerCase()];
				const userBalance = vault && vault.underlyingToken ? new BigNumber(vault.underlyingToken.balance) : new BigNumber(0);
				if (userBalance.gt(0))
					return (
						<SettListItem
							key={`wallet-${sett.name}`}
							sett={sett}
							balance={formatBalance(vault.underlyingToken)}
							balanceValue={formatTokenBalanceValue(vault.underlyingToken, currency)}
							currency={currency}
							onOpen={() => onOpen(vault, sett)}/>
					);
			})
		);
	};

	const getDepositListDisplay = (): (JSX.Element | undefined)[] => {
		const error = isError();
		if (error) return [error];

		return (
			settList!.map((sett) => {
				const vault: Vault = vaults[sett.vaultToken.toLowerCase()];
				const userBalance = vault ? vault.balance.toNumber() : 0;
				if (userBalance > 0)
					return (
						<SettListItem
							key={`deposit-${sett.name}`}
							sett={sett}
							balance={formatBalanceUnderlying(vault)}
							balanceValue={formatBalanceValue(vault, currency)}
							currency={currency}
							onOpen={() => onOpen(vault, sett)}/>
					);
			})
		);
	};

	const getVaultListDisplay = (): (JSX.Element | undefined)[] => {
		const error = isError();
		if (error) return [error];

		return (
			settList!.map((sett) => {
				const vault: Vault = vaults[sett.vaultToken.toLowerCase()];
				const geyser: Geyser | undefined = vault ? vault.geyser : undefined;
				const userBalance = geyser ? geyser.balance.toNumber() : 0;
				if (geyser && userBalance > 0)
					return (
						<SettListItem
							key={`deposit-${sett.name}`}
							sett={sett}
							balance={formatGeyserBalance(geyser)}
							balanceValue={formatGeyserBalanceValue(geyser, currency)}
							currency={currency}
							onOpen={() => onOpen(vault, sett)}/>
					);
			})
		);
	};

	if (!hideZeroBal) {
		let totalValueLocked: string | undefined;
		if (totalValue) {
			totalValueLocked = isUsd ? usdToCurrency(totalValue, currency) : formatPrice(totalValue, currency);
		}
		return (
			<>
				<TableHeader
					title={`Your Vault Deposits - ${totalValueLocked}`}
					tokenTitle={'Tokens'}
					classes={classes}
					period={period}/>
				<List className={classes.list}>{getSettListDisplay()}</List>
				<SettDialog dialogProps={dialogProps} classes={classes} onClose={onClose}/>
			</>
		);
	}	else {
		const walletBalance = formatPrice(stats.stats.wallet, currency);
		const depositBalance = formatPrice(stats.stats.deposits, currency);
		const vaultBalance = formatPrice(stats.stats.vaultDeposits, currency);
		const walletList = _.compact(getWalletListDisplay());
		const depositList = _.compact(getDepositListDisplay());
		const vaultList = _.compact(getVaultListDisplay());
		return(
			<>
				{walletList.length > 0 && (
					<>
						<TableHeader
							title={`Your Wallet - ${walletBalance}`}
							tokenTitle="Available"
							classes={classes}
							period={period} />
						<List className={classes.list}>{walletList}</List>
					</>
				)}
				{depositList.length > 0 && (
					<>
						<TableHeader
							title={`Your Vault Deposits - ${depositBalance}`}
							tokenTitle="Tokens"
							classes={classes}
							period={period} />
						<List className={classes.list}>{depositList}</List>
					</>
				)}
				{vaultList.length > 0 && (
					<>
						<TableHeader
							title={`Your Staked Amounts - ${vaultBalance}`}
							tokenTitle="Tokens"
							classes={classes}
							period={period} />
						<List className={classes.list}>{vaultList}</List>
					</>
				)}
				{walletList.length === 0 && depositList.length === 0 && vaultList.length === 0 && (
					<Typography align="center" variant="subtitle1" color="textSecondary" style={{ margin: '2rem 0' }}>
							Your address does not have tokens to deposit.
					</Typography>
				)}
				<SettDialog dialogProps={dialogProps} classes={classes} onClose={onClose}/>
			</>
		);
	}
});

export default SettListV2;
