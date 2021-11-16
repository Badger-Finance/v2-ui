import { Button, makeStyles } from '@material-ui/core';
import routes from 'config/routes';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { useConnectWallet } from 'mobx/utils/hooks';
import React from 'react';
import { useContext } from 'react';

const useStyles = makeStyles((theme) => ({
	buttonContainer: {
		paddingBottom: theme.spacing(1),
		display: 'flex',
		justifyContent: 'flex-end',
		[theme.breakpoints.down('sm')]: {
			justifyContent: 'center',
		},
	},
}));

const ViewBoostButton = observer((): JSX.Element | null => {
	const { onboard, router } = useContext(StoreContext);
	const connectWallet = useConnectWallet();
	const classes = useStyles();

	if (!onboard.isActive()) {
		return (
			<Button color="primary" variant="contained" onClick={connectWallet}>
				Connect Wallet
			</Button>
		);
	}

	return (
		<div className={classes.buttonContainer}>
			<Button color="primary" variant="contained" onClick={() => router.goTo(routes.boostOptimizer)}>
				Calculate Boost
			</Button>
		</div>
	);
});

export default ViewBoostButton;
