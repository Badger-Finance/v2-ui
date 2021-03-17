import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { makeStyles } from '@material-ui/core/styles';
import { getVaults } from 'config/system/vaults';
import { Vault } from 'mobx/model';
import { formatPrice } from 'mobx/reducers/statsReducers';
import { Loader } from 'components/Loader';
import { formatUsd } from 'mobx/utils/api';
import SettDialog from './SettDialog';
import DepositList from './DepositList';
import AllSettList from './AllSettList';

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

export const SettList = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { hideEmpty } = props;

	const {
		contracts: { vaults, geysers, tokens },
		sett: { assets, setts, diggSetts },
		uiState: { stats, currency, period },
		wallet: { network },
	} = store;
	const [dialogProps, setDialogProps] = useState({ open: false, vault: undefined as any, sett: undefined as any });

	const onOpen = (vault: Vault, sett: any) => {
		setDialogProps({ vault: vault, open: true, sett: sett });
	};

	const onClose = () => {
		setDialogProps({ ...dialogProps, open: false });
	};

	let allSetts: any[] = [];
	if (setts && diggSetts) {
		allSetts = setts.concat(diggSetts);
	}

	if (!tokens || !vaults || !geysers) {
		return <Loader />;
	}
	const tvl = assets.totalValue ? `${formatUsd(assets.totalValue)}` : '$0.00';

	var contracts = [];
	if (network.vaults.digg) contracts.push(...network.vaults.digg.contracts);
	if (network.vaults.sushiswap) contracts.push(...network.vaults.sushiswap.contracts);
	if (network.vaults.uniswap) contracts.push(...network.vaults.uniswap.contracts);

	const depositListProps = {
		contracts: contracts,
		allSetts,
		vaults,
		hideEmpty,
		classes,
		onOpen,
		period,
		vaultBalance: formatPrice(stats.stats.vaultDeposits, currency),
		depositBalance: formatPrice(stats.stats.deposits, currency),
		walletBalance: formatPrice(stats.stats.wallet, currency),
	};

	const settListProps = {
		allSetts,
		vaults,
		hideEmpty,
		classes,
		onOpen,
		period,
		wallet: stats.stats.wallet,
		tvl,
		walletBalance: formatPrice(stats.stats.wallet, currency),
	};

	return (
		<div className={classes.settListContainer}>
			{!hideEmpty && <AllSettList {...settListProps} />}
			{hideEmpty && <DepositList {...depositListProps} />}
			<SettDialog dialogProps={dialogProps} classes={classes} onClose={onClose} />
		</div>
	);
});
