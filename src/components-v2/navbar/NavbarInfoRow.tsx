import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { NavbarStats } from './NavbarStats';
import { NavbarSocialContact } from './NavbarSocialContact';

const useStyles = makeStyles(() => ({
	badgerIconContainer: {
		width: '28px',
		height: '28px',
		marginRight: 23,
	},
	badgerIcon: {
		width: '100%',
	},
}));

export const NavbarInfoRow = (): JSX.Element => {
	const classes = useStyles();
	return (
		<Grid container alignItems="center" justifyContent="space-between">
			<Grid item container xs={9} md={8} lg={9} alignItems="center">
				<Grid item className={classes.badgerIconContainer}>
					<img className={classes.badgerIcon} alt="Badger Logo" src={'/assets/icons/badger_head.svg'} />
				</Grid>
				<Grid item xs>
					<NavbarStats />
				</Grid>
			</Grid>
			<Grid item container xs justifyContent="flex-end">
				<NavbarSocialContact />
			</Grid>
		</Grid>
	);
};
