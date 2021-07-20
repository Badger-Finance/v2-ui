import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import {
	List,
	ListItem,
	Drawer,
	Collapse,
	IconButton,
	ListItemIcon,
	ListItemText,
	ListItemSecondaryAction,
	Grid,
	Hidden,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandMore } from '@material-ui/icons';
import { SITE_VERSION, NETWORK_LIST, FLAGS } from 'config/constants';
import NetworkWidget from 'components-v2/common/NetworkWidget';
import { Route } from 'mobx-router';
import { RootStore } from 'mobx/store';
import clsx, { ClassValue } from 'clsx';
import SecurityIcon from '@material-ui/icons/Security';

const DRAWER_WIDTH = 240;

const useStyles = makeStyles((theme) => ({
	contentRoot: {
		height: '100%',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	drawer: {
		[theme.breakpoints.up('md')]: {
			width: DRAWER_WIDTH,
			flexShrink: 0,
		},
	},
	drawerPaper: {
		width: DRAWER_WIDTH,
	},
	logo: {
		height: '2.4rem',
		width: 'auto',
	},
	listHeader: {
		fontSize: '.8rem',
		textTransform: 'uppercase',
		color: theme.palette.primary.main,
	},
	link: {
		color: 'inherit',
		textDecoration: 'none',
	},
	listItem: {
		cursor: 'pointer',
		'&:hover': {
			backgroundColor: 'transparent',
			cursor: 'pointer',
		},
		padding: theme.spacing(1, 3),
	},
	collapseWrapper: {},
	divider: {
		padding: theme.spacing(2, 2, 1, 2),
		fontSize: '.8rem',
	},
	primarySubListItem: {
		width: 'auto',
		border: 0,
	},
	secondaryListItem: {
		cursor: 'pointer',
		justifyContent: 'space-between',
		'&:hover': {
			backgroundColor: '#070707',
		},
		padding: theme.spacing(0.5, 2),
	},
	secondarySubListItem: {
		cursor: 'pointer',
		justifyContent: 'space-between',
		background: ' rgba(0, 0, 0, .2)',
		padding: theme.spacing(0.5, 2, 0.5, 3),
	},
	activeListItem: {
		fontWeight: 'bold',
		backgroundColor: '#070707',
		width: 'auto',
		border: 0,
		'&:hover': {
			backgroundColor: '#070707',
			cursor: 'pointer',
		},
		padding: theme.spacing(1, 3),
	},
	currency: {
		marginTop: theme.spacing(1),
	},
	rewards: {
		margin: theme.spacing(0, 0, 0, 1),
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
	},
	expandOpen: {
		transform: 'rotate(180deg)',
	},
	icon: {
		width: '1.1em',
		height: '1.1rem',
		display: 'inline-block',
	},
	smallItemText: {
		fontSize: '11px',
	},
	subItemGutters: {
		paddingLeft: theme.spacing(5),
		paddingRight: theme.spacing(5),
	},
}));

export const Sidebar = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const {
		router: { goTo },
		uiState: { sidebarOpen, closeSidebar },
		rewards: { badgerTree },
		wallet: { network, connectedAddress },
	} = store;

	const [expanded, setExpanded] = useState('');

	const getTokens = () => {
		return network.sidebarTokenLinks.map((value) => {
			return (
				<ListItem
					button
					key={value.title}
					className={classes.secondarySubListItem}
					onClick={() => window.open(value.url.toString())}
				>
					{value.title}
				</ListItem>
			);
		});
	};

	const getPricing = () => {
		return network.sidebarPricingLinks.map((value) => {
			return (
				<ListItem
					button
					key={value.title}
					className={classes.secondarySubListItem}
					onClick={() => window.open(value.url.toString())}
				>
					{value.title}
				</ListItem>
			);
		});
	};

	const navigate = (path: Route<RootStore, any, any>) => {
		closeSidebar();
		return goTo(path);
	};

	const getItemClass = (path: string, listClass: string, ...additionalClasses: ClassValue[]): string => {
		const isActive = store.router.currentPath == path;
		return clsx(isActive ? classes.activeListItem : listClass, ...additionalClasses);
	};

	// TODO: Deprecate this in favor of router integration https://github.com/Badger-Finance/v2-ui/issues/709
	const getCollapsableItemClasses = (
		collapseKey: string,
		childrenRoutes: string[],
		...additionalClasses: ClassValue[]
	) => {
		const isNotCollapsed = expanded !== collapseKey;
		const isAnyChildrenActiveRoute = childrenRoutes.includes(store.router.currentPath);
		const shouldCollapseBeActive = isNotCollapsed && isAnyChildrenActiveRoute;

		return clsx(classes.listItem, shouldCollapseBeActive && classes.activeListItem, ...additionalClasses);
	};

	const drawerContent = (
		<Grid container className={classes.contentRoot}>
			<Grid item>
				<List>
					<ListItem button className={classes.listItem}>
						<img alt="Badger Logo" src={'assets/badger-logo.png'} className={classes.logo} />
						<ListItemSecondaryAction>
							<NetworkWidget />
						</ListItemSecondaryAction>
					</ListItem>

					{network.name === NETWORK_LIST.ETH ? (
						<ListItem
							button
							onClick={() => setExpanded(expanded === 'advanced' ? '' : 'advanced')}
							style={{ marginTop: '.5rem' }}
							className={classes.listItem}
						>
							{SITE_VERSION}
							<IconButton
								size="small"
								className={classes.expand + ' ' + (expanded === 'advanced' ? classes.expandOpen : '')}
								aria-label="show more"
							>
								<ExpandMore />
							</IconButton>
						</ListItem>
					) : (
						<ListItem button style={{ marginTop: '.5rem' }} className={classes.listItem}>
							{SITE_VERSION}
						</ListItem>
					)}
					<Collapse in={expanded === 'advanced'} timeout="auto" unmountOnExit>
						{network.name === NETWORK_LIST.ETH && badgerTree && connectedAddress ? (
							<ListItem key="rewards">
								<ListItemText
									primary={`Cycle Count: ${badgerTree.cycle}`}
									secondary={
										badgerTree?.timeSinceLastCycle &&
										badgerTree.timeSinceLastCycle + ' since last cycle'
									}
								/>
							</ListItem>
						) : (
							<ListItem key="rewards">
								<ListItemText secondary={'Connect address to see cycle information'} />
							</ListItem>
						)}
					</Collapse>
					<ListItem
						button
						className={getItemClass('/', classes.listItem)}
						onClick={() => {
							navigate(views.home);
						}}
					>
						<ListItemIcon>
							<img alt="Badger Setts Logo" className={classes.icon} src={'assets/sidebar/sett.png'} />
						</ListItemIcon>
						<ListItemText primary="Sett Vaults" />
					</ListItem>
					{network.name === NETWORK_LIST.ETH ? (
						<>
							<ListItem
								button
								className={getItemClass('/guarded', classes.listItem)}
								onClick={() => goTo(views.guarded)}
							>
								<ListItemIcon>
									<SecurityIcon fontSize="small" />
								</ListItemIcon>
								<ListItemText primary="Guarded Vaults" />
							</ListItem>
							<ListItem
								button
								className={getItemClass('/digg', classes.listItem)}
								onClick={() => navigate(views.digg)}
							>
								<ListItemIcon>
									<img
										alt="Badger Digg Icon"
										src={'assets/sidebar/digg-white.png'}
										className={classes.icon}
									/>
								</ListItemIcon>
								<ListItemText primary="Digg" />
							</ListItem>
							<ListItem
								button
								className={getItemClass('/ibBTC', classes.listItem)}
								onClick={() => navigate(views.IbBTC)}
							>
								<ListItemIcon>
									<img
										alt="Interest Bearing Badger Bitcoin Icon"
										src={'assets/sidebar/ibbtc-white.svg'}
										className={classes.icon}
									/>
								</ListItemIcon>
								<ListItemText primary="Interest Bearing BTC" />
							</ListItem>
							<ListItem
								button
								className={
									classes.listItem +
									' ' +
									(store.router.currentPath == '/bridge' ? classes.activeListItem : '')
								}
								onClick={() => navigate(views.bridge)}
							>
								<ListItemIcon>
									<img src="/assets/sidebar/icon-badger-bridge.svg" className={classes.icon} />
								</ListItemIcon>
								<ListItemText primary="Bridge" />
							</ListItem>
							<ListItem
								button
								className={getCollapsableItemClasses('boosts', ['/boost-optimizer', '/leaderboard'])}
								onClick={() => {
									setExpanded(expanded === 'boosts' ? '' : 'boosts');
								}}
							>
								<ListItemIcon>
									<img alt="Boosts" src={'assets/sidebar/boosts.png'} className={classes.icon} />
								</ListItemIcon>
								<ListItemText primary="Boost" />
								<IconButton
									size="small"
									className={clsx(classes.expand, expanded === 'tokens' && classes.expandOpen)}
									aria-label="show more"
								>
									<ExpandMore />
								</IconButton>
							</ListItem>
							<Collapse
								classes={{ wrapper: classes.collapseWrapper }}
								in={expanded === 'boosts'}
								timeout="auto"
								unmountOnExit
							>
								{FLAGS.BOOST_OPTIMIZER && (
									<ListItem
										button
										classes={{ gutters: classes.subItemGutters }}
										className={getItemClass('/boost-optimizer', classes.primarySubListItem)}
										onClick={() => navigate(views.boostOptimizer)}
									>
										Boost Optimizer
									</ListItem>
								)}
								<ListItem
									button
									classes={{ gutters: classes.subItemGutters }}
									className={getItemClass('/leaderboard', classes.primarySubListItem)}
									onClick={() => navigate(views.boostLeaderBoard)}
								>
									Boost Leaderboard
								</ListItem>
							</Collapse>
							<ListItem
								button
								className={getCollapsableItemClasses('badger-zone', [
									'/honey-badger-drop',
									'/experimental',
									'/airdrops',
									'/honey-badger-drop',
								])}
								onClick={() => setExpanded(expanded === 'badger-zone' ? '' : 'badger-zone')}
							>
								<ListItemIcon>
									<img
										alt="Badger Arcade"
										src={'assets/sidebar/gas_station.png'}
										className={classes.icon}
									/>
								</ListItemIcon>
								<ListItemText primary="Badger Arcade" />
								<IconButton
									size="small"
									className={classes.expand + ' ' + (expanded === 'tokens' ? classes.expandOpen : '')}
									aria-label="show more"
								>
									<ExpandMore />
								</IconButton>
							</ListItem>
							<Collapse
								classes={{ wrapper: classes.collapseWrapper }}
								in={expanded === 'badger-zone'}
								timeout="auto"
								unmountOnExit
							>
								<ListItem
									button
									classes={{ gutters: classes.subItemGutters }}
									className={getItemClass('/experimental', classes.primarySubListItem)}
									onClick={() => navigate(views.experimental)}
								>
									Experimental Vaults
								</ListItem>
								<ListItem
									button
									classes={{ gutters: classes.subItemGutters }}
									className={getItemClass('/airdrops', classes.primarySubListItem)}
									onClick={() => navigate(views.airdrops)}
								>
									Airdrops
								</ListItem>
								<ListItem
									button
									classes={{ gutters: classes.subItemGutters }}
									className={getItemClass('/honey-badger-drop', classes.primarySubListItem)}
									onClick={() => navigate(views.honeybadgerDrop)}
								>
									Honey Badger Drop
								</ListItem>
							</Collapse>
						</>
					) : (
						<></>
					)}
				</List>
			</Grid>
			<Grid item>
				<List>
					<ListItem
						button
						className={classes.listItem}
						onClick={() =>
							window.open(
								'https://app.nexusmutual.io/cover/buy/get-quote?address=0x6354E79F21B56C11f48bcD7c451BE456D7102A36',
							)
						}
					>
						<ListItemIcon>
							<img alt="Nexus Logo" src={'assets/sidebar/nexus_logo_bw.png'} className={classes.icon} />
						</ListItemIcon>
						<ListItemText>
							Get Coverage
							<div className={classes.smallItemText}>Powered By Nexus Mutual</div>
						</ListItemText>
					</ListItem>

					<ListItem
						button
						className={classes.secondaryListItem}
						onClick={() => window.open('https://forum.badger.finance')}
					>
						Forum
					</ListItem>

					<ListItem
						button
						className={classes.secondaryListItem}
						onClick={() => window.open('https://snapshot.page/#/badgerdao.eth')}
					>
						Governance
					</ListItem>

					<ListItem
						button
						className={classes.secondaryListItem}
						onClick={() => setExpanded(expanded === 'tokens' ? '' : 'tokens')}
					>
						Tokens
						<IconButton
							size="small"
							className={classes.expand + ' ' + (expanded === 'tokens' ? classes.expandOpen : '')}
							aria-label="show more"
						>
							<ExpandMore />
						</IconButton>
					</ListItem>

					<Collapse in={expanded === 'tokens'} timeout="auto" unmountOnExit>
						{getTokens()}
					</Collapse>

					<ListItem
						button
						className={classes.secondaryListItem}
						onClick={() => setExpanded(expanded === 'pricing' ? '' : 'pricing')}
					>
						Pricing
						<IconButton
							size="small"
							className={classes.expand + ' ' + (expanded === 'pricing' ? classes.expandOpen : '')}
							aria-label="show more"
						>
							<ExpandMore />
						</IconButton>
					</ListItem>

					<Collapse in={expanded === 'pricing'} timeout="auto" unmountOnExit>
						{getPricing()}
					</Collapse>

					<ListItem
						button
						className={classes.secondaryListItem}
						onClick={() => setExpanded(expanded === 'socials' ? '' : 'socials')}
					>
						Socials
						<IconButton
							size="small"
							className={classes.expand + ' ' + (expanded === 'socials' ? classes.expandOpen : '')}
							aria-label="show more"
						>
							<ExpandMore />
						</IconButton>
					</ListItem>

					<Collapse in={expanded === 'socials'} timeout="auto" unmountOnExit>
						<ListItem
							button
							className={classes.secondarySubListItem}
							onClick={() => window.open('https://www.twitter.com/badgerdao')}
						>
							Twitter
						</ListItem>
						<ListItem
							button
							className={classes.secondarySubListItem}
							onClick={() => window.open('https://badgerdao.medium.com')}
						>
							Medium
						</ListItem>
						<ListItem
							button
							className={classes.secondarySubListItem}
							onClick={() => window.open('https://discord.com/invite/xSPFHHS')}
						>
							Discord
						</ListItem>
						<ListItem
							button
							className={classes.secondarySubListItem}
							onClick={() => window.open('https://t.me/badger_dao')}
						>
							Telegram
						</ListItem>
					</Collapse>

					<ListItem
						button
						className={classes.secondaryListItem}
						onClick={() => window.open('https://badger.wiki/')}
					>
						Wiki
					</ListItem>
					<ListItem
						button
						className={classes.secondaryListItem}
						onClick={() =>
							window.open('https://badgerdao.medium.com/badger-developer-program-3bf0cb2cc5f1')
						}
					>
						Developer Program
					</ListItem>
				</List>
			</Grid>
		</Grid>
	);

	return (
		<nav className={classes.drawer}>
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
				>
					{drawerContent}
				</Drawer>
			</Hidden>
			<Hidden smDown>
				<Drawer
					classes={{
						paper: classes.drawerPaper,
					}}
					variant="permanent"
					open
				>
					{drawerContent}
				</Drawer>
			</Hidden>
		</nav>
	);
});
