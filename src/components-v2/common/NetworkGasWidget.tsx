import React, { useContext, useRef, useState } from 'react';
import { Button, Popper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import NetworkOptions from '../network-selector/NetworkOptions';
import { getNetworkIconPath } from '../../utils/network-icon';

const useStyles = makeStyles({
	networkButton: {
		minWidth: 37,
		textAlign: 'center',
		padding: 0,
	},
	selectedNetworkIcon: {
		width: 17,
		height: 17,
	},
	popover: {
		zIndex: 2,
	},
});

const NetworkGasWidget = (): JSX.Element => {
	const classes = useStyles();
	const { network: networkStore } = useContext(StoreContext);
	const ref = useRef<HTMLButtonElement | null>(null);
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				ref={ref}
				className={classes.networkButton}
				variant="outlined"
				color="primary"
				onClick={() => setOpen(true)}
				aria-label="open network selector"
			>
				<img
					className={classes.selectedNetworkIcon}
					src={getNetworkIconPath(networkStore.network.symbol)}
					alt="selected network icon"
				/>
			</Button>
			<Popper
				open={open}
				className={classes.popover}
				onMouseLeave={() => setOpen(false)}
				anchorEl={ref.current}
				placement="bottom-end"
			>
				<NetworkOptions onSelect={() => setOpen(false)} />
			</Popper>
		</>
	);
};

export default observer(NetworkGasWidget);
