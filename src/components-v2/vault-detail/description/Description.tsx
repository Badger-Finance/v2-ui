import React, { useContext } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Vault } from '@badger-dao/sdk';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { getVaultIconPath } from '../../../utils/componentHelpers';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
	},
	namesContainer: {
		marginLeft: theme.spacing(1),
	},
	settName: {
		display: 'inline',
		fontSize: 24,
	},
	vaultName: {
		fontSize: 14,
	},
	settLogo: {
		width: '100%',
		margin: 'auto',
	},
	logoContainer: {
		display: 'flex',
		width: 68,
		height: 68,
	},
}));

interface Props {
	vault: Vault;
}

export const Description = observer(({ vault }: Props): JSX.Element => {
	const { network } = useContext(StoreContext);
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<Grid item className={classes.logoContainer}>
				<img
					className={classes.settLogo}
					src={getVaultIconPath(vault, network.network)}
					alt={`Badger ${vault.name} Vault Symbol`}
				/>
			</Grid>
			<Grid item container direction="column" justifyContent="center" className={classes.namesContainer}>
				<Grid item container alignItems="center">
					<Typography className={classes.settName}>
						{vault.protocol} - {vault.name}
					</Typography>
				</Grid>
				<Grid item>
					<Typography className={classes.vaultName} color="textSecondary">
						{vault.asset}
					</Typography>
				</Grid>
			</Grid>
		</div>
	);
});
