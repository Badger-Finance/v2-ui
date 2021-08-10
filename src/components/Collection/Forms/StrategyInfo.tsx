import React, { useState, useContext } from 'react';
import { Button, Backdrop, Modal, Fade, Typography, Divider, List, ListItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/store-context';
import { Network } from 'mobx/model/network/network';

export interface FeeListProps {
	vaultAddress: string;
	network: Network;
}

const useStyles = makeStyles((theme) => ({
	buttonContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(2),
	},
	modal: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	paper: {
		backgroundColor: theme.palette.background.paper,
		boxShadow: theme.shadows[5],
		padding: theme.spacing(2, 2, 3),
		borderRadius: 8,
		outline: 'none',
		display: 'flex',
		flexDirection: 'column',
		minHeight: '30%',
		maxHeight: '75%',
		minWidth: '25%',
		maxWidth: '50%',
		overflowY: 'auto',
		overflowWrap: 'break-word',
		wordWrap: 'break-word',
	},
	rewardsContainer: {
		padding: '0',
	},
	modalTitle: {
		textAlign: 'center',
		paddingBottom: theme.spacing(3),
	},
	divider: {
		[theme.breakpoints.down('sm')]: {
			marginTop: theme.spacing(1),
			marginBottom: theme.spacing(1),
		},
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
	},
	link: {
		color: theme.palette.text.primary,
		fontWeight: 800,
	},
}));

export const StrategyInfo = (props: FeeListProps): JSX.Element => {
	const { network, vaultAddress } = props;
	const store = useContext(StoreContext);
	const feeList = network.getFees(vaultAddress);
	const classes = useStyles();
	const strategy = network.strategies[vaultAddress];
	const { setts } = store;
	const sett = setts.getSett(vaultAddress);
	const underlyingToken = sett?.underlyingToken;

	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<div>
			<div className={classes.buttonContainer}>
				<Button variant="text" color="primary" onClick={handleOpen}>
					INFO
				</Button>
				<Button variant="text" color="primary" onClick={() => window.open(strategy.strategyLink)}>
					STRATEGY
				</Button>
			</div>

			<Modal
				aria-labelledby="fee-modal"
				aria-describedby="Description of fees"
				open={open}
				onClose={handleClose}
				className={classes.modal}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={open}>
					<div className={classes.paper}>
						<Typography className={classes.modalTitle} variant="h6">
							INFORMATION
						</Typography>
						<Typography variant="body2" color="textSecondary">
							Fees are charged on certain Sett Vaults, and are sent to the BadgerDAO treasury, or shared
							with the strategist who wrote the vault strategy.
						</Typography>
						<Divider className={classes.divider} />
						<Typography variant="caption">Note:</Typography>
						<Typography variant="caption">
							- Performance Fees are assessed on the profit that the strategy creates
						</Typography>
						<Typography variant="caption">
							- Management Fees are charged on the entire principal over the course of a year
						</Typography>
						<Typography variant="caption">
							- Both Performance and Management Fees are factored into all ROI calculations
						</Typography>
						<Divider className={classes.divider} />
						<List className={classes.rewardsContainer}>
							{feeList.length > 0 ? (
								feeList.map((fee: string) => (
									<ListItem key={fee}>
										<Typography variant="subtitle2" color="textSecondary">
											{fee}
										</Typography>
									</ListItem>
								))
							) : (
								<Typography variant="subtitle2" color="textSecondary">
									There are no fees for this vault.
								</Typography>
							)}
						</List>
						<Divider className={classes.divider} />
						<Typography variant="subtitle1">LINKS</Typography>
						<Typography variant="caption">
							- Vault Address:{' '}
							<a
								className={classes.link}
								target="_blank"
								rel="noreferrer"
								href={`${network.explorer}/address/${vaultAddress}`}
							>
								{vaultAddress}
							</a>
						</Typography>
						<Typography variant="caption">
							- Strategy Address:{' '}
							<a
								className={classes.link}
								target="_blank"
								rel="noreferrer"
								href={`${network.explorer}/address/${strategy.address}`}
							>
								{strategy.address}
							</a>
						</Typography>
						<Typography variant="caption">
							- Underlying Token Address:{' '}
							<a
								className={classes.link}
								target="_blank"
								rel="noreferrer"
								href={`${network.explorer}/address/${underlyingToken}`}
							>
								{underlyingToken}
							</a>
						</Typography>
					</div>
				</Fade>
			</Modal>
		</div>
	);
};
