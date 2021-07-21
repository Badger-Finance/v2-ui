import { Backdrop, Button, Grid, Modal, Fade, Paper, Typography, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import React, { useState, useContext } from 'react';
import DroptModalItem from './DroptModalItem';
import { StoreContext } from 'mobx/store-context';
import { getToken } from 'web3/config/token-config';
import deploy from '../../config/deployments/mainnet.json';

const useStyles = makeStyles((theme) => ({
	droptPaper: {
		padding: theme.spacing(2),
		marginBottom: theme.spacing(2),
		textAlign: 'center',
		minWidth: '15%',
	},
	droptItem: {
		marginBottom: theme.spacing(1),
		paddingLeft: theme.spacing(0.5),
	},
	droptTitleText: {
		marginBottom: theme.spacing(1),
	},
	negativeTopMargin: {
		marginTop: -theme.spacing(0.5),
	},
	droptModalButton: {
		marginBottom: theme.spacing(1),
	},
	modal: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	redeemContainer: {},
}));

const DroptModal = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const {
		user,
		rewards: { mockBalance },
	} = store;

	const [open, setOpen] = useState(false);

	const dropt2Address = deploy.digg_system.DROPT['DROPT-2'].longToken;
	const dropt2Token = getToken(dropt2Address);

	const droptBalance = dropt2Token ? user.getTokenBalance(dropt2Token) : mockBalance(dropt2Address);

	const handleModalClick = () => {
		setOpen(!open);
	};

	const hasBalance = (): boolean => {
		if (process.env.NODE_ENV !== 'production') return true;
		return droptBalance.balance.gt(0);
	};

	return (
		<>
			<Grid className={classes.droptModalButton} container direction="row" justify="flex-end">
				<Button
					aria-label="Redeem DROPT-2"
					variant="contained"
					size="small"
					color="primary"
					onClick={handleModalClick}
					disabled={!hasBalance()}
				>
					Redeem DROPT
				</Button>
			</Grid>

			<Modal
				aria-labelledby="claim-modal"
				aria-describedby="Claim your rewards"
				open={open}
				onClose={() => setOpen(false)}
				className={classes.modal}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={open}>
					<Paper className={classes.droptPaper}>
						<Typography variant="subtitle1" className={classes.droptTitleText}>
							DROPT Available Redemptions
						</Typography>
						<DroptModalItem token="DROPT-2" balance={droptBalance.balanceDisplay(5)} />
					</Paper>
				</Fade>
			</Modal>
		</>
	);
});

export default DroptModal;
