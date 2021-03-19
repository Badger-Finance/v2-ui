import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import _ from 'lodash';
import { getNetwork, getNetworkName } from 'mobx/utils/web3';
import { ArrowDropDown } from '@material-ui/icons';
import {
	Button, Popper,
	Paper,
	List,
	ListItem, makeStyles, Typography
} from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
	network: {
		marginRight: theme.spacing(1),
		pointerEvents: 'none'
	},
	selectButton: {
		textTransform: 'uppercase'
	},
	listItem: {
		textTransform: 'uppercase'
	}
}));

const NetworkWidget = observer(() => {
	const classes = useStyles();
	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: any) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};
	const optionClicked = (option: string) => {
		window.location.href = `https://${option}-app.badger.finance`
	}

	let network = getNetwork(getNetworkName()).name
	let options = _.filter(['bsc', 'eth'], (x: string) => x !== network)

	return (<>
		<Button size="small" variant="outlined" endIcon={<ArrowDropDown />} onClick={handleClick} className={classes.selectButton}>
			<NetworkOption network={network} />
		</Button>
		<Popper style={{ zIndex: 100000 }} placement="bottom-end" id={'popper'} open={open} anchorEl={anchorEl}>
			<Paper onMouseLeave={() => setAnchorEl(null)}>
				<List>
					{_.map(options, (option: string) =>
						<ListItem className={classes.listItem} button onClick={() => optionClicked(option)} >	<NetworkOption network={option} /></ListItem>
					)}
				</List>
			</Paper>

		</Popper>
	</>
	);
});

export default NetworkWidget;



const NetworkOption = (props: { network: any }) => {

	return (
		<div style={{ alignItems: 'center', display: 'flex' }}>
			<Typography variant="body1" component="div">
				{props.network}
			</Typography>
		</div>
	);

};
