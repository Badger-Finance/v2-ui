import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import SettBadge from './SettBadge';
import { makeStyles } from '@material-ui/core/styles';
import { Sett, SettState } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
	symbol: {
		marginTop: 'auto',
		marginBottom: 'auto',
		padding: theme.spacing(0, 0, 0, 0),
		marginRight: theme.spacing(2),
		display: 'inline-block',
		float: 'left',
		width: '2.4rem',
	},
	vaultIcon: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	tagContainer: {
		display: 'flex',
		alignItems: 'center',
		marginLeft: theme.spacing(2),
	},
	newTag: {
		background: 'white',
		textTransform: 'uppercase',
		fontSize: '12px',
		fontWeight: 700,
		color: theme.palette.background.paper,
		padding: theme.spacing(0.5),
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(2),
		borderRadius: '25px',
	},
	nameContainer: {
		display: 'flex',
	},
}));

interface Props {
	sett: Sett;
}

export const SettItemName = ({ sett }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid sm container>
			<Grid item className={classes.vaultIcon}>
				<img
					alt={`Badger ${sett.name} Vault Symbol`}
					className={classes.symbol}
					src={`/assets/icons/${sett.settAsset.toLowerCase()}.png`}
				/>
			</Grid>
			<Grid item>
				<Grid container direction={'column'}>
					<Typography variant="body1">{sett.name}</Typography>
					<Grid container direction={'row'}>
						<Typography variant="caption" color="textSecondary">
							{sett.protocol}
						</Typography>
						{sett.state === SettState.Deprecated && <SettBadge protocol={'No Emissions'} />}
					</Grid>
				</Grid>
			</Grid>
			{sett.newVault && (
				<Grid item className={classes.tagContainer}>
					<div className={classes.newTag}>New</div>
				</Grid>
			)}
		</Grid>
	);
};
