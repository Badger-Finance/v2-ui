import React from 'react';
import { Grid } from '@material-ui/core';
import { NavbarTabs } from './NavbarTabs';
import { NavbarButtons } from './NavbarButtons';

export const NavbarActionsRow = (): JSX.Element => {
	return (
		<Grid container>
			<Grid item xs="auto">
				<NavbarTabs />
			</Grid>
			<Grid item container xs>
				<NavbarButtons />
			</Grid>
		</Grid>
	);
};
