import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Drawer, Hidden, IconButton, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import Menu from 'ui-library/Menu';
import MenuItem from 'ui-library/MenuItem';
import MenuItemText from '../../ui-library/MenuItemText';
import MenuItemIcon from '../../ui-library/MenuItemIcon';
import { Typography } from '../../ui-library/Typography';
import { inCurrency } from '../../mobx/utils/helpers';
import { Currency } from '../../config/enums/currency.enum';

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
						Rewards ({inCurrency(claimableRewards, Currency.USD, 2)})
					</MenuItem>
					<MenuItem button onClick={() => window.open('https://docs.badger.com/')}>
						Wiki
					</MenuItem>
					<MenuItem button onClick={() => window.open('https://snapshot.page/#/badgerdao.eth')}>
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
			</Drawer>
		</Hidden>
	);
});

export default Sidebar;
