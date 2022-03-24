import React, { useContext } from 'react';
import { Button, Grid, makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
	messageContainer: {
		paddingTop: 70,
	},
	titleText: {
		paddingBottom: theme.spacing(2),
	},
	linkContainer: {
		paddingTop: theme.spacing(2),
	},
	helpTextContainer: {
		width: 339,
		textAlign: 'center',
		margin: '18px auto 0px auto',
		[theme.breakpoints.down('xs')]: {
			width: 225,
		},
	},
	switchButtonContainer: {
		marginTop: 26,
		[theme.breakpoints.down('xs')]: {
			marginTop: 17,
		},
	},
}));

interface Props {
	network: string;
}

const NoVaults = ({ network }: Props): JSX.Element => {
	const { uiState } = useContext(StoreContext);
	const classes = useStyles();

	return (
		<Grid container direction="column" className={classes.messageContainer}>
			<Grid item container justifyContent="center">
				<img src={'/assets/icons/screwdriver-badger.svg'} alt="Badger Builder" />
			</Grid>
			<Grid item container direction="column" justifyContent="center" className={classes.helpTextContainer}>
				<Typography variant="h5" color="textSecondary">
					No vaults to display
				</Typography>
				<Typography variant="body2" color="textSecondary">
					Badgers are working hard to build vaults on {network}. Switch network for more investment
					opportunities.
				</Typography>
			</Grid>
			<Grid item container justifyContent="center" className={classes.switchButtonContainer}>
				<Button color="primary" variant="outlined" onClick={uiState.openNetworkOptions}>
					Switch Networks
				</Button>
			</Grid>
		</Grid>
	);
};

export default observer(NoVaults);
