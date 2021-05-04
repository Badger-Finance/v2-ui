import React, { useState } from 'react';
import { Network } from '../../../mobx/model';
import { Button, Backdrop, Modal, Fade, Typography, Divider, List, ListItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

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
	},
	rewardsContainer: {
		padding: '0',
		minHeight: '20%',
		maxHeight: '75%',
		overflowY: 'auto',
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
}));

export const StrategyInfo = (props: FeeListProps): JSX.Element => {
	const { network, vaultAddress } = props;
	const feeList = network.getFees(vaultAddress);
	const classes = useStyles();

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
					FEES
				</Button>
				<Button
					variant="text"
					color="primary"
					onClick={() => window.open(network.strategies[vaultAddress].strategyLink)}
				>
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
							FEE DESCRIPTIONS
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
					</div>
				</Fade>
			</Modal>
		</div>
	);
};
