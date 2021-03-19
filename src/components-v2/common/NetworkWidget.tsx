import React, { useContext } from 'react';
import { makeStyles, Button } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import _ from 'lodash';
import { getNetwork, getNetworkName } from 'mobx/utils/web3';

const useStyles = makeStyles((theme) => ({
	network: {
		marginRight: theme.spacing(1),
		pointerEvents: 'none'
	},
}));

const NetworkWidget = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	let network = getNetwork(getNetworkName()).name

	return (
		<Button
			disableElevation
			variant="text"
			size="small"
			className={classes.network}
		>
			{network}
		</Button>
	);
});

export default NetworkWidget;
