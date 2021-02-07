import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { makeStyles } from '@material-ui/core/styles';
import { vaultBatches } from 'config/system/vaults';
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
		// border: `1px solid ${theme.palette.grey[100]}`,
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
		// background: 'rgba(0,0,0,.5)',
		padding: theme.spacing(2, 2, 2),
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
	} = store;

	const [dialogProps, setDialogProps] = useState({ open: false, vault: undefined as any, sett: undefined as any });

	const onOpen = (vault: Vault, sett: any) => {
		setDialogProps({ vault, open: true, sett });
	};

	const onClose = () => {
		setDialogProps({ ...dialogProps, open: false });
	};

	let allSetts: any = undefined;
	if (setts && diggSetts) {
		allSetts = setts.concat(diggSetts);
	}

	if (!tokens || !vaults || !geysers) {
		return <Loader />;
	}

	const spacer = () => <div className={classes.before} />;

	const tvl = assets.totalValue ? formatUsd(assets.totalValue) : '$0.00';

	const depositListProps = {
		contracts: [...vaultBatches[2].contracts, ...vaultBatches[1].contracts, ...vaultBatches[0].contracts],
		vaults,
		hideEmpty,
		classes,
		onOpen,
		period,
		depositBalance: formatPrice(stats.stats.deposits, currency),
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
		<>
			<AllSettList {...settListProps} />
			{hideEmpty && <DepositList {...depositListProps} />}
			<SettDialog dialogProps={dialogProps} classes={classes} onClose={onClose} />
			{spacer()}
		</>
	);
});
