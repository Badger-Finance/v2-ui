import { Drawer, Hidden, IconButton, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { SITE_VERSION } from 'config/constants';
import routes from 'config/routes';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import Menu from 'ui-library/Menu';
import MenuItem from 'ui-library/MenuItem';

import MenuItemIcon from '../../ui-library/MenuItemIcon';
import MenuItemText from '../../ui-library/MenuItemText';
import { Typography } from '../../ui-library/Typography';

const useStyles = makeStyles((theme) => ({
	drawerPaper: {
		background: '#3a3a3a',
		[theme.breakpoints.down('sm')]: {
			width: 315,
		},
		[theme.breakpoints.down('xs')]: {
			width: 291,
		},
	},
	socialsContainer: {
		display: 'flex',
		justifyContent: 'flex-start',
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(1),
		paddingLeft: 16,
	},
	socialIcon: {
		height: 14,
		width: 14,
		cursor: 'pointer',
		marginRight: 8,
	},
}));

const Sidebar = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const {
		uiState: { sidebarOpen, closeSidebar, openRewardsDialog },
		rewards: { claimableRewards },
	} = store;

	const closeDialogTransitionDuration = useTheme().transitions.duration.leavingScreen;

	const handleRewardsClick = () => {
		closeSidebar();
		setTimeout(() => {
			openRewardsDialog();
		}, closeDialogTransitionDuration);
	};

	return (
		<Hidden mdUp>
			<Drawer
				variant="temporary"
				anchor="left"
				open={sidebarOpen}
				onClose={() => closeSidebar()}
				classes={{
					paper: classes.drawerPaper,
				}}
				ModalProps={{
					keepMounted: true, // Better open performance on mobile.
				}}
				disableEnforceFocus
			>
				<Menu disablePadding>
					<MenuItem>
						<MenuItemText>
							<Typography variant="h5">Menu</Typography>
						</MenuItemText>
						<MenuItemIcon>
							<IconButton onClick={() => closeSidebar()}>
								<CloseIcon />
							</IconButton>
						</MenuItemIcon>
					</MenuItem>
					<MenuItem button onClick={handleRewardsClick}>
						Rewards ({claimableRewards.toFixed(2)})
					</MenuItem>
					<MenuItem button onClick={() => window.open('https://docs.badger.com/')}>
						Wiki
					</MenuItem>
					<MenuItem button onClick={() => store.router.goTo(routes.governance)}>
						Governance
					</MenuItem>
					<MenuItem button onClick={() => window.open('https://forum.badger.finance')}>
						Forum
					</MenuItem>
				</Menu>
				<div className={classes.socialsContainer}>
					<img
						onClick={() => window.open('https://discord.gg/badgerdao', '_blank')}
						className={classes.socialIcon}
						alt="Discord Icon"
						src="/assets/icons/discord.svg"
					/>
					<img
						onClick={() => window.open('https://twitter.com/BadgerDAO', '_blank')}
						className={classes.socialIcon}
						alt="Twitter Icon"
						src="/assets/icons/twitter.svg"
					/>
					<img
						onClick={() => window.open('https://t.me/badger_dao', '_blank')}
						className={classes.socialIcon}
						alt="Telegram Icon"
						src="/assets/icons/telegram.svg"
					/>
				</div>
				<span className={classes.socialsContainer}>{SITE_VERSION}</span>
			</Drawer>
		</Hidden>
	);
});

export default Sidebar;
