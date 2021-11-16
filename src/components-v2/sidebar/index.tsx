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
	ListItemText,
	Hidden,
	Typography,
	useMediaQuery,
	useTheme,
	Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandMore } from '@material-ui/icons';
import { SITE_VERSION } from 'config/constants';
import { Skeleton } from '@material-ui/lab';
import { inCurrency } from '../../mobx/utils/helpers';
import SidebarItem from './SidebarItem';
import { getSidebarConfig } from './sidebar.config';
import SidebarSection from './SidebarSection';
import CloseIcon from '@material-ui/icons/Close';
import CurrencyDisplay from '../common/CurrencyDisplay';

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
		padding: theme.spacing(0.75, 2),
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
		'&:hover': {
			background: '#434343',
		},
	},
	sidebarContainer: {
		display: 'flex',
		flexDirection: 'column',
		minHeight: '100vh',
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
		padding: theme.spacing(1),
		paddingLeft: '14px',
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

	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
	const [expanded, setExpanded] = useState('');

	const badgerToken = network.deploy.token.length > 0 ? network.deploy.token : undefined;
	const badgerPrice = badgerToken ? prices.getPrice(badgerToken) : undefined;

	const config = getSidebarConfig(network.symbol);
	const drawerContent = (
		<div className={classes.sidebarContainer}>
			{isMobile ? (
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
					<img alt="Badger Logo" className={classes.badgerIcon} src={'/assets/icons/badger.png'} />
					<span className={classes.badgerTitle}>Badger</span>
				</div>
			)}
			<div className={classes.linksContainer}>
				{config.cycle ? (
					<>
						<ListItem
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
				<SidebarItem route="/" view={views.home} title="Vaults" />
				<SidebarItem route="/guarded" view={views.guarded} title="Guarded Vaults" />
				{config.digg && <SidebarItem route="/digg" view={views.digg} title="Digg" />}
				{config.ibBTC && <SidebarItem route="/ibBTC" view={views.IbBTC} title="ibBTC" />}
				{config.bridge && <SidebarItem route="/bridge" view={views.bridge} title="Bridge" />}
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
				{config.arcade && (
					<SidebarSection
						title="Arcade"
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
						<CurrencyDisplay
							displayValue={inCurrency(badgerPrice, currency)}
							variant="subtitle2"
							justify="center"
						/>
					) : (
						<Skeleton width={32} animation="wave">
							<Typography variant="subtitle2">Placeholder</Typography>
						</Skeleton>
					)}
				</ListItem>
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
			</List>
		</div>
	);

	return (
		<nav className={classes.drawer}>
			<Hidden mdUp>
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
