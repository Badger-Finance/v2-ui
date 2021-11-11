import React, { useContext } from 'react';
import { Select, MenuItem, makeStyles, Typography, Grid } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { LocalGasStation } from '@material-ui/icons';
import { Loader } from 'components/Loader';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
	gasSelector: {
		overflow: 'hidden',
	},
	gasIcon: {
		cursor: 'pointer',
		fontSize: '1.2rem',
		marginRight: '.8rem',
	},
	loadingComponent: {
		textAlign: 'center',
		width: '33%',
	},
}));

interface Props {
	className?: HTMLButtonElement['className'];
}

const GasWidget = observer(({ className }: Props) => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	const { gasPrice, setGasPrice } = store.uiState;
	const { gasPrices, network } = store.network;

	if (!gasPrices) {
		return (
			<Grid className={classes.loadingComponent} container direction="column">
				<Loader size={15} />
				<Typography variant="caption">Loading Gas...</Typography>
			</Grid>
		);
	}

	const getGasSelections = () => {
		const gasMap: any = [];
		for (const [key, value] of Object.entries(gasPrices)) {
			const displayValue = typeof value === 'number' ? value : value.maxFeePerGas;
			gasMap.push(
				<MenuItem value={key} key={key}>
					{displayValue ? displayValue.toFixed(0) : 10}
				</MenuItem>,
			);
		}
		return gasMap;
	};

	const gasIcon = (
		<LocalGasStation onClick={() => window.open(network.gasProviderUrl, '_blank')} className={classes.gasIcon} />
	);

	return (
		<Select
			variant="outlined"
			color="secondary"
			value={gasPrice}
			onChange={(v: any) => setGasPrice(v.target.value)}
			className={clsx(classes.gasSelector, className)}
			startAdornment={gasIcon}
		>
			{getGasSelections()}
		</Select>
	);
});

export default GasWidget;
