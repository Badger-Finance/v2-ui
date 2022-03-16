import React from 'react';
import Menu from '../../ui-library/Menu';
import { makeStyles } from '@material-ui/core/styles';
import { supportedNetworks } from '../../config/networks.config';
import MenuSubheader from '../../ui-library/MenuSubheader';
import NetworkOption from './NetworkOption';

const useStyles = makeStyles((theme) => ({
	networkListIcon: {
		width: 17,
		height: 17,
		marginRight: theme.spacing(1),
	},
	root: {
		minWidth: 234,
	},
	active: {
		backgroundColor: 'rgba(0, 0, 0, 0.04)',
	},
}));

interface Props {
	onSelect: () => void;
}

const NetworkOptions = ({ onSelect }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<Menu disablePadding className={classes.root} subheader={<MenuSubheader>NETWORK</MenuSubheader>}>
			{supportedNetworks.map((network) => (
				<NetworkOption key={network.symbol} network={network} onSelect={onSelect} />
			))}
		</Menu>
	);
};

export default NetworkOptions;
