import React from 'react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { Button, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LocalGasStation } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(0),
		width: '100%',
	},
	redDot: {
		display: 'block',
		width: theme.spacing(0.9),
		height: theme.spacing(0.8),
		marginLeft: theme.spacing(0.4),
		borderRadius: theme.spacing(0.4),
		background: theme.palette.error.main,
	},
	greenDot: {
		display: 'block',
		width: theme.spacing(0.9),
		height: theme.spacing(0.8),
		marginLeft: theme.spacing(0.4),
		borderRadius: theme.spacing(0.4),
		background: theme.palette.success.main,
	},
	select: {
		height: '2.1rem',
		fontSize: '.9rem',
		overflow: 'hidden',
		marginRight: theme.spacing(1),
		minWidth: '93px',
	},
}));

export const Wallet = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const { gasPrice, setGasPrice } = store.uiState;
	const { gasPrices } = store.wallet;
	const wsOnboard = store.wallet.onboard;
	const connectedAddress = store.wallet.connectedAddress;

	const shortenAddress = (address: string) => {
		return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
	};

	const connect = async () => {
		if (store.uiState.sidebarOpen) {
			store.uiState.closeSidebar();
		}
		if (!(await wsOnboard.walletSelect())) return;
		const readyToTransact = await wsOnboard.walletCheck();
		if (readyToTransact) {
			store.wallet.connect(wsOnboard);
		}
	};

	const onGasStationClicked = () => {
		window.open('https://gasnow.org', '_blank');
	};

	return (
		<div style={{ display: 'flex' }}>
			<Select
				variant="outlined"
				color="secondary"
				value={gasPrice}
				onChange={(v: any) => setGasPrice(v.target.value)}
				className={classes.select}
				startAdornment={
					<LocalGasStation
						onClick={onGasStationClicked}
						style={{ cursor: 'pointer', fontSize: '1.2rem', marginRight: '.8rem' }}
					/>
				}
			>
				<MenuItem value={'slow'}>{gasPrices['slow'].toFixed(0)}</MenuItem>
				<MenuItem value={'standard'}>{gasPrices['standard'].toFixed(0)}</MenuItem>
				<MenuItem value={'rapid'}>{gasPrices['rapid'].toFixed(0)}</MenuItem>
			</Select>
			<Button
				aria-label={!!connectedAddress ? shortenAddress(connectedAddress) : 'CLICK TO CONNECT'}
				disableElevation
				variant="contained"
				color="secondary"
				onClick={() => {
					if (!connectedAddress) connect();
					else store.wallet.walletReset();
				}}
				endIcon={<div className={!!connectedAddress ? classes.greenDot : classes.redDot} />}
			>
				{!!connectedAddress ? shortenAddress(connectedAddress) : 'CLICK TO CONNECT'}
			</Button>
		</div>
	);
});
