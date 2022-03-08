import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { Drawer, Collapse, IconButton, Hidden, useMediaQuery, useTheme, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandMore } from '@material-ui/icons';
import { SITE_VERSION } from 'config/constants';
import SidebarItem from './SidebarItem';
import { getSidebarConfig } from './sidebar.config';
import SidebarSection from './SidebarSection';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';

const DRAWER_WIDTH = 200;

const useStyles = makeStyles((theme) => ({
	contentRoot: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	drawer: {
		[theme.breakpoints.up('lg')]: {
			width: DRAWER_WIDTH,
			flexShrink: 0,
		},
	},
	drawerPaper: {
		width: DRAWER_WIDTH,
	},
	expand: {
		transform: 'rotate(0deg)',
		marginLeft: 'auto',
		pointerEvents: 'none',
		height: '1rem',
		width: '1rem',
		transition: theme.transitions.create('transform', {
			duration: theme.transitions.duration.shortest,
		}),
		marginRight: theme.spacing(2),
	},
	expandOpen: {
		transform: 'rotate(180deg)',
	},
	badgerPrice: {
		whiteSpace: 'pre-wrap',
	},
	versionContainer: {
		paddingBottom: theme.spacing(0.75),
		paddingLeft: '27px',
		'&:hover': {
			background: '#434343',
		},
		padding: theme.spacing(0.5),
		display: 'flex',
		alignItems: 'center',
		lineHeight: '20px',
	},
	boostText: {
		fontSize: '13px',
		cursor: 'default',
	},
	rankText: {
		color: theme.palette.text.secondary,
		fontSize: '10px',
		cursor: 'default',
	},
	boostContainer: {
		display: 'flex',
		flexDirection: 'column',
	},
	sidebarContainer: {
		display: 'flex',
		flexDirection: 'column',
		minHeight: '100%',
		borderRight: '1px solid #2B2B2B',
		background: theme.palette.background.default,
	},
	linksContainer: {
		display: 'flex',
		flexDirection: 'column',
		flexGrow: 1,
	},
	socialsContainer: {
		display: 'flex',
		justifyContent: 'flex-start',
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1),
		paddingLeft: '27px',
	},
	socialIcon: {
		height: '25px',
		width: '25px',
		cursor: 'pointer',
		padding: theme.spacing(0.5),
		marginRight: theme.spacing(0.25),
	},
	badgerLogoContainer: {
		display: 'flex',
		height: '77px',
		alignItems: 'center',
		paddingLeft: '27px',
		cursor: 'pointer',
	},
	badgerIcon: {
		width: '28px',
		height: '28px',
		marginRight: theme.spacing(2),
	},
	badgerTitle: {
		textTransform: 'uppercase',
		letterSpacing: '2px',
	},
	siteVersion: {
		fontSize: '10px',
		lineHeight: '20px',
		fontWeight: 400,
		paddingLeft: '27px',
		cursor: 'default',
	},
	daoContainer: {
		paddingBottom: theme.spacing(2),
	},
	daoItem: {
		cursor: 'pointer',
		paddingLeft: '27px',
		paddingTop: theme.spacing(0.25),
		paddingBottom: theme.spacing(0.25),
		'&:hover': {
			background: '#434343',
		},
	},
}));

const Sidebar = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const {
		uiState: { sidebarOpen, closeSidebar },
		rewards: { badgerTree },
		network: { network },
		user: { accountDetails },
	} = store;

	const isMobileOrTablet = useMediaQuery(useTheme().breakpoints.down('md'));
	const [expanded, setExpanded] = useState(false);

	const config = getSidebarConfig(network.symbol);
	const drawerContent = (
		<div className={classes.sidebarContainer}>
			{isMobileOrTablet ? (
				<Box display="flex" justifyContent="flex-end">
					<IconButton onClick={() => closeSidebar()}>
						<CloseIcon />
					</IconButton>
				</Box>
			) : (
				<div
					className={classes.badgerLogoContainer}
					onClick={() => window.open('https://badger.com/', '_blank')}
				>
					<img alt="Badger Logo" className={classes.badgerIcon} src={'/assets/icons/badger_head.svg'} />
					<span className={classes.badgerTitle}>Badger</span>
				</div>
			)}
			<div className={classes.linksContainer}>
				{accountDetails && (
					<div className={classes.versionContainer} onClick={() => setExpanded(!expanded)}>
						<div className={classes.boostContainer}>
							<span className={classes.boostText}>{`Boost: ${accountDetails.boost}`}</span>
							<span className={classes.rankText}>{`Rank: ${accountDetails.boostRank}`}</span>
						</div>
						<div className={clsx(classes.expand, expanded && classes.expandOpen)}>
							<ExpandMore />
						</div>
					</div>
				)}
				<Collapse in={expanded} timeout="auto" unmountOnExit>
					<div className={classes.versionContainer}>
						<div className={classes.boostContainer}>
							<span className={classes.boostText}>{`Cycle: ${badgerTree.cycle}`}</span>
							<span className={classes.rankText}>{`${
								badgerTree?.timeSinceLastCycle && badgerTree.timeSinceLastCycle + ' since last cycle'
							}`}</span>
						</div>
					</div>
				</Collapse>
				<SidebarItem route="/" view={views.home} title="Vaults" />
				{config.digg && <SidebarItem route="/digg" view={views.digg} title="Digg" />}
				{config.ibBTC && <SidebarItem route="/ibBTC" view={views.IbBTC} title="ibBTC" />}
				{config.boost && (
					<SidebarSection
						title="Boost"
						items={[
							{
								title: 'Boost Optimizer',
								route: '/boost-optimizer',
								view: views.boostOptimizer,
							},
							{
								title: 'Boost Leaderboard',
								route: '/leaderboard',
								view: views.boostLeaderBoard,
							},
						]}
					/>
				)}
				{config.auction && <SidebarItem route="/citadel" view={views.citadel} title="Citadel" />}
			</div>
			<div className={classes.daoContainer}>
				<div className={classes.daoItem} onClick={() => window.open('https://docs.badger.com/')}>
					Documentation
				</div>
				<div className={classes.daoItem} onClick={() => window.open('https://forum.badger.finance')}>
					Forum
				</div>
				<div className={classes.daoItem} onClick={() => window.open('https://snapshot.page/#/badgerdao.eth')}>
					Governance
				</div>
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
				<span className={classes.siteVersion}>{SITE_VERSION}</span>
			</div>
		</div>
	);

	return (
		<div className={classes.drawer}>
			<Hidden lgUp>
				<Drawer
					variant="temporary"
					anchor="right"
					open={sidebarOpen}
					onClose={() => closeSidebar()}
					classes={{
						paper: classes.drawerPaper,
					}}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
				>
					{drawerContent}
				</Drawer>
			</Hidden>
			<Hidden mdDown>{drawerContent}</Hidden>
		</div>
	);
});

export default Sidebar;
