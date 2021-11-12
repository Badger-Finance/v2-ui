import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { List, ListItem, Drawer, Collapse, IconButton, ListItemText, Hidden, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandMore } from '@material-ui/icons';
import { SITE_VERSION } from 'config/constants';
import { Skeleton } from '@material-ui/lab';
import { inCurrency } from '../../mobx/utils/helpers';
import SidebarItem from './SidebarItem';
import { getSidebarConfig } from './sidebar.config';
import SidebarSection from './SidebarSection';

const DRAWER_WIDTH = 200;

const useStyles = makeStyles((theme) => ({
	contentRoot: {
		display: 'flex',
		overflowX: 'hidden',
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
	textListItem: {
		userSelect: 'none',
		msUserSelect: 'none',
		MozUserSelect: 'none',
		WebkitUserSelect: 'none',
		padding: theme.spacing(1, 3),
	},
	secondaryListItem: {
		cursor: 'pointer',
		justifyContent: 'space-between',
		'&:hover': {
			backgroundColor: '#070707',
		},
		padding: theme.spacing(0.5, 2),
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
	badgerPrice: {
		whiteSpace: 'pre-wrap',
	},
	versionContainer: {
		paddingBottom: theme.spacing(0.75),
		paddingLeft: '27px',
	},
	sidebarContainer: {
		display: 'flex',
		flexDirection: 'column',
		minHeight: '100vh',
		borderRight: '0.5px solid #848484',
		background: theme.palette.background.paper,
	},
	linksContainer: {
		display: 'flex',
		flexDirection: 'column',
		flexGrow: 1,
	},
	socialsContainer: {
		display: 'flex',
		justifyContent: 'space-around',
		padding: theme.spacing(2),
	},
	socialIcon: {
		height: '30px',
		width: '30px',
		cursor: 'pointer',
		padding: theme.spacing(0.5),
	},
	badgerLogoContainer: {
		display: 'flex',
		height: '77px',
		alignItems: 'center',
		paddingLeft: '27px',
	},
	badgerIcon: {
		width: '28px',
		height: '28px',
		margin: theme.spacing(1),
		marginRight: theme.spacing(2),
	},
	badgerTitle: {
		textTransform: 'uppercase',
		letterSpacing: '2px',
	},
}));

const Sidebar = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const {
		prices,
		uiState: { sidebarOpen, closeSidebar, currency },
		rewards: { badgerTree },
		network: { network },
		user: { accountDetails },
	} = store;

	const [expanded, setExpanded] = useState('');

	const badgerToken = network.deploy.token.length > 0 ? network.deploy.token : undefined;
	const badgerPrice = badgerToken ? prices.getPrice(badgerToken) : undefined;

	const config = getSidebarConfig(network.symbol);
	const drawerContent = (
		<div className={classes.sidebarContainer}>
			<div className={classes.badgerLogoContainer}>
				<img alt="Badger Logo" className={classes.badgerIcon} src={'/assets/icons/badger_head.svg'} />
				<span className={classes.badgerTitle}>Badger</span>
			</div>
			<div className={classes.linksContainer}>
				{config.cycle ? (
					<>
						<ListItem
							button
							onClick={() => setExpanded(expanded === 'advanced' ? '' : 'advanced')}
							className={classes.versionContainer}
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
						<Collapse in={expanded === 'advanced'} timeout="auto" unmountOnExit>
							<ListItem className={classes.textListItem} key="rewards">
								<ListItemText
									primary={`Cycle Count: ${badgerTree.cycle}`}
									secondary={
										badgerTree?.timeSinceLastCycle &&
										badgerTree.timeSinceLastCycle + ' since last cycle'
									}
								/>
							</ListItem>
						</Collapse>
					</>
				) : (
					<>
						<ListItem button className={classes.secondaryListItem}>
							{SITE_VERSION}
						</ListItem>
						<ListItem key="rewards">
							<ListItemText secondary={'Connect address to see cycle information'} />
						</ListItem>
					</>
				)}
				{accountDetails && (
					<ListItem className={`${classes.versionContainer}`} key="boost">
						<ListItemText
							primary={`Boost: ${accountDetails?.boost.toFixed(2)}`}
							secondary={`Rank: ${accountDetails.boostRank}`}
						/>
					</ListItem>
				)}
				<SidebarItem
					route="/"
					view={views.home}
					title="Vaults"
					icon="/assets/sidebar/sett.png"
					alt="Vault Icon"
				/>
				<SidebarItem
					route="/guarded"
					view={views.guarded}
					title="Guarded Vaults"
					icon="/assets/sidebar/shield.svg"
					alt="Shield Icon"
				/>
				{config.digg && (
					<SidebarItem
						route="/digg"
						view={views.digg}
						title="Digg"
						icon="/assets/sidebar/digg-white.png"
						alt="Digg Icon"
					/>
				)}
				{config.ibBTC && (
					<SidebarItem
						route="/ibBTC"
						view={views.IbBTC}
						title="ibBTC"
						icon="/assets/sidebar/ibbtc-white.svg"
						alt="ibBTC Icon"
					/>
				)}
				{config.bridge && (
					<SidebarItem
						route="/bridge"
						view={views.bridge}
						title="Bridge"
						icon="/assets/sidebar/icon-badger-bridge.svg"
						alt="Bridge Icon"
					/>
				)}
				{config.boost && (
					<SidebarSection
						title="Boost"
						icon="/assets/sidebar/boosts.png"
						alt="Boost Icon"
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
				{config.arcade && (
					<SidebarSection
						title="Arcade"
						icon="/assets/sidebar/gas_station.png"
						alt="Boost Icon"
						items={[
							{
								title: 'Experimental Vaults',
								route: '/experimental',
								view: views.experimental,
							},
							{
								title: 'Airdrops',
								route: '/airdrops',
								view: views.airdrops,
							},
							{
								title: 'Honey Badger Drop',
								route: '/honey-badger-drop',
								view: views.honeybadgerDrop,
							},
						]}
					/>
				)}
			</div>
			<List>
				<ListItem className={classes.badgerPrice}>
					<Typography variant="body2">Badger Price: </Typography>
					{badgerPrice ? (
						<Typography variant="subtitle2">{inCurrency(badgerPrice, currency)}</Typography>
					) : (
						<Skeleton width={32} animation="wave">
							<Typography variant="subtitle2">Placeholder</Typography>
						</Skeleton>
					)}
				</ListItem>
				<div className={classes.socialsContainer}>
					<img
						onClick={() => window.open('https://discord.gg/BNGTCTAt', '_blank')}
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
			</List>
		</div>
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

export default Sidebar;
