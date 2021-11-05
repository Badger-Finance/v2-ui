import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import SettBadge from './SettBadge';
import { makeStyles } from '@material-ui/core/styles';
import { Sett } from '@badger-dao/sdk';

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
}));

interface Props {
	sett: Sett;
}

export const SettItemName = ({ sett }: Props): JSX.Element => {
	const classes = useStyles();
	const displayName = sett.name.split(' ').length > 1 ? sett.name.split(' ').slice(1).join(' ') : sett.name;

	return (
		<Grid container>
			<Grid item className={classes.vaultIcon}>
				<img
					alt={`Badger ${sett.name} Vault Symbol`}
					className={classes.symbol}
					src={`/assets/icons/${sett.settAsset.toLowerCase()}.png`}
				/>
			</Grid>
			<Grid item>
				<Grid container direction={'column'}>
					<Typography variant="body1">{displayName}</Typography>
					<Grid container direction={'row'}>
						<Typography variant="caption" color="textSecondary">
							{sett.name.split(' ')[0]}
						</Typography>
						{sett.deprecated && <SettBadge protocol={'No Emissions'} />}
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};
