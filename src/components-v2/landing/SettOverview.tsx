import { Grid, Container, makeStyles } from '@material-ui/core';
import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';
import { Select, MenuItem, Tooltip} from '@material-ui/core';
import React, { useContext } from 'react';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles((theme) => ({
}));

const SettOverview = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
  
  const {
		contracts: { vaults, geysers, tokens },
		sett: { assets, setts, diggSetts },
		uiState: { stats, currency, period },
	} = store;

	return (
		<Select>
	</Select>
	);
});

export default SettOverview;
