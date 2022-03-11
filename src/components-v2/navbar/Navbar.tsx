import React from 'react';
import { LayoutContainer } from '../common/Containers';
import { NavbarInfoRow } from './NavbarInfoRow';
import { Divider, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { NavbarActionsRow } from './NavbarActionsRow';
import { NavbarMobileRow } from './NavbarMobileRow';
import { NavbarStats } from './NavbarStats';
import { NavbarTabs } from './NavbarTabs';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
		backgroundColor: '#2a2a2a',
		position: 'sticky',
		top: 0,
		zIndex: 1,
		[theme.breakpoints.up('md')]: {
			paddingTop: '15px',
		},
	},
	actions: {
		marginTop: 21,
	},
	mobileRow: {
		padding: '16px 40px',
		[theme.breakpoints.down('sm')]: {
			padding: '16px 30px',
		},
	},
	mobileStats: {
		position: 'relative',
		overflowX: 'auto',
		[theme.breakpoints.down('sm')]: {
			padding: '16px 10px 16px 30x',
		},
	},
	mobileTabs: {
		[theme.breakpoints.down('xs')]: {
			paddingTop: 30,
		},
	},
}));

export const Navbar = (): JSX.Element => {
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

	if (isMobile) {
		return (
			<div className={classes.root}>
				<div className={classes.mobileRow}>
					<NavbarMobileRow />
				</div>
				<Divider />
				<div className={clsx(classes.mobileRow, classes.mobileStats)}>
					<NavbarStats />
				</div>
				<Divider />
				<div className={classes.mobileTabs}>
					<NavbarTabs />
				</div>
			</div>
		);
	}

	return (
		<div className={classes.root}>
			<LayoutContainer>
				<NavbarInfoRow />
				<div className={classes.actions}>
					<NavbarActionsRow />
				</div>
			</LayoutContainer>
		</div>
	);
};
