import React, { useContext, useRef } from 'react';
import { Button, Popper, ClickAwayListener } from '@material-ui/core';
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
		zIndex: 110,
	},
});

const NetworkGasWidget = (): JSX.Element => {
	const classes = useStyles();
	const {
		network: networkStore,
		uiState: { areNetworkOptionsOpen, openNetworkOptions, closeNetworkOptions },
	} = useContext(StoreContext);
	const ref = useRef<HTMLButtonElement | null>(null);
	return (
		<ClickAwayListener onClickAway={closeNetworkOptions}>
			<div>
				<Button
					ref={ref}
					className={classes.networkButton}
					variant="outlined"
					color="primary"
					onClick={openNetworkOptions}
					aria-label="open network selector"
				>
					<img
						className={classes.selectedNetworkIcon}
						src={getNetworkIconPath(networkStore.network.symbol)}
						alt="selected network icon"
					/>
				</Button>
				<Popper
					open={areNetworkOptionsOpen}
					className={classes.popover}
					onMouseLeave={closeNetworkOptions}
					anchorEl={ref.current}
					placement="bottom-end"
				>
					<NetworkOptions onSelect={closeNetworkOptions} />
				</Popper>
			</div>
		</ClickAwayListener>
	);
};

export default observer(NetworkGasWidget);
