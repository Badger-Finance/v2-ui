import { Backdrop, Button, Grid, Modal, Fade, Paper, Typography, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import React, { useState, useContext } from 'react';
import DroptModalItem from './DroptModalItem';
import { StoreContext } from 'mobx/store-context';
import { formatTokens } from 'mobx/utils/helpers';
import { redemptionToLongToken } from 'config/system/rebase';
import BigNumber from 'bignumber.js';
import { DEBUG } from 'config/environment';

const useStyles = makeStyles((theme) => ({
	droptPaper: {
		padding: theme.spacing(2),
		marginBottom: theme.spacing(2),
		textAlign: 'center',
		minWidth: '20%',
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
}));

const DroptModal = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const {
		user,
		setts,
		rebase: { rebase },
	} = store;

	const [open, setOpen] = useState(false);

	if (!rebase || rebase.validDropts.length === 0) {
		console.log('no valid rebase', rebase?.validDropts.length);
		return (
			<Grid className={classes.droptModalButton} container direction="row" justify="flex-end">
				<Button aria-label="Redeem Dropt" variant="contained" size="small" color="primary" disabled={true}>
					Redeem DROPT
				</Button>
			</Grid>
		);
	}

	const droptModalItems = rebase.validDropts.map((dropt) => {
		const redemptionAddress = Object.keys(dropt)[0];
		const droptAddress = redemptionToLongToken(redemptionAddress);
		const droptToken = setts.getToken(droptAddress);
		const droptBalance = user.getTokenBalance(droptAddress);
		const expiryPrice = new BigNumber(dropt[redemptionAddress].expiryPrice);
		if (!droptToken || droptBalance.balance.lte(0)) {
			if (DEBUG && !droptToken) console.log('error retrieving', redemptionAddress, 'token');
			return;
		}
		const redemptionAmount = formatTokens(
			expiryPrice.multipliedBy(droptBalance.balance).dividedBy(10 ** droptToken.decimals),
		);

		return (
			<DroptModalItem
				key={droptToken.symbol}
				token={droptToken.symbol}
				balance={droptBalance.balance}
				displayBalance={droptBalance.balanceDisplay(5)}
				redemptionAmount={redemptionAmount}
				redemptionContract={redemptionAddress}
			/>
		);
	});

	const handleModalClick = () => {
		setOpen(!open);
	};

	return (
		<>
			<Grid className={classes.droptModalButton} container direction="row" justify="flex-end">
				<Button
					id="redeem-button"
					aria-label="Redeem DROPT"
					variant="contained"
					size="small"
					color="primary"
					onClick={handleModalClick}
					disabled={droptModalItems.length <= 0}
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
						<Typography id="modalTitle" variant="subtitle1" className={classes.droptTitleText}>
							DROPT Available Redemptions
						</Typography>
						{droptModalItems}
					</Paper>
				</Fade>
			</Modal>
		</>
	);
});

export default DroptModal;
