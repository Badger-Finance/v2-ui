import React from 'react';
import { Divider, Grid, Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CallMadeIcon from '@material-ui/icons/CallMade';

const useStyles = makeStyles({
	root: {
		backgroundColor: '#FFB62B40',
		borderRadius: 8,
		padding: '10px 15px',
	},
	divider: {
		margin: '4px 0',
	},
});

interface Props {
	migratingVault?: string;
	link?: string;
}

const VaultDeprecationWarning = ({ link, migratingVault }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<Grid container direction="column" className={classes.root}>
			<Grid item>
				<Typography variant="h6" display="inline">
					Vault Discontinued
				</Typography>
				{link && (
					<Link color="textPrimary" href={link} rel="noreferrer" target="_blank">
						<CallMadeIcon />
					</Link>
				)}
			</Grid>
			<Divider className={classes.divider} />
			<Grid item>
				<Typography variant="body2">
					{migratingVault
						? `This vault has been discontinued and will no longer receive rewards. Move your funds to the
							${migratingVault} vault to continue earning with BadgerDAO.`
						: 'This vault has been discontinued and will no longer receive rewards.'}
				</Typography>
			</Grid>
		</Grid>
	);
};

export default VaultDeprecationWarning;
