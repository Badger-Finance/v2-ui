import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ArrowDropDown } from '@material-ui/icons';
import { Button, Popper, Paper, List, ListItem, makeStyles, Typography } from '@material-ui/core';
import { StoreContext } from 'mobx/store-context';

const useStyles = makeStyles((theme) => ({
	network: {
		marginRight: theme.spacing(1),
		pointerEvents: 'none',
	},
	selectButton: {
		textTransform: 'uppercase',
	},
	listItem: {
		textTransform: 'uppercase',
	},
}));

const NetworkWidget = observer(() => {
	const classes = useStyles();
	const { wallet } = useContext(StoreContext);
	const connectedNetwork = wallet.network.name;

	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: any) => {
		if (wallet.connectedAddress) {
			return;
		}
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};
	const optionClicked = (option: string) => {
		wallet.setNetwork(option);
		setAnchorEl(null);
	};

	const options = ['eth', 'bsc'].filter((option) => option !== connectedNetwork);
	return (
		<>
			<Button
				size="small"
				variant="outlined"
				endIcon={<ArrowDropDown />}
				onClick={handleClick}
				className={classes.selectButton}
			>
				<NetworkOption network={connectedNetwork} />
			</Button>
			<Popper style={{ zIndex: 100000 }} placement="bottom-end" id={'popper'} open={open} anchorEl={anchorEl}>
				<Paper onMouseLeave={() => setAnchorEl(null)}>
					<List>
						{options.map((network) => {
							return (
								<ListItem
									className={classes.listItem}
									button
									onClick={() => optionClicked(network)}
									key={network}
								>
									<NetworkOption network={network} />
								</ListItem>
							);
						})}
					</List>
				</Paper>
			</Popper>
		</>
	);
});

const NetworkOption = (props: { network: string }) => {
	return (
		<div style={{ alignItems: 'center', display: 'flex' }}>
			<Typography variant="body1" component="div">
				{props.network}
			</Typography>
		</div>
	);
};

export default NetworkWidget;
