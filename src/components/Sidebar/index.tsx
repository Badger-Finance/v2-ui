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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandMore } from '@material-ui/icons';
import { SITE_VERSION, NETWORK_LIST, FLAGS } from 'config/constants';
import NetworkWidget from 'components-v2/common/NetworkWidget';
import { QueryParams, Route } from 'mobx-router';
import { RootStore } from 'mobx/store';

const useStyles = makeStyles((theme) => ({
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
	root: {
		padding: theme.spacing(0),
		width: theme.spacing(30),
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		minHeight: '100%',
		overflow: 'hidden',
	},
	drawer: {},
	listItem: {
		cursor: 'pointer',
		'&:hover': {
			backgroundColor: 'transparent',
			cursor: 'pointer',
		},
		padding: theme.spacing(1, 3),
	},
	divider: {
		padding: theme.spacing(2, 2, 1, 2),
		fontSize: '.8rem',
	},
	primarySubListItem: {
		margin: theme.spacing(0, -999),
		width: 'auto',
		border: 0,
		padding: theme.spacing(1, 1002),
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
		'&:hover': {},
		padding: theme.spacing(0.5, 2, 0.5, 3),
	},
	activeListItem: {
		fontWeight: 'bold',
		backgroundColor: '#070707',
		borderRadius: theme.shape.borderRadius,
		margin: theme.spacing(0, -999),
		width: 'auto',
		border: 0,
		padding: theme.spacing(1, 1002),
		'&:hover': {
			backgroundColor: '#070707',
			cursor: 'pointer',
		},
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
}));

export const Sidebar = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const {
		router: { goTo },
		uiState: { sidebarOpen, closeSidebar },
		rewards: { badgerTree },
		wallet: { network },
		user,
	} = store;

	const [expanded, setExpanded] = useState('');

	const getTokens = () => {
		return network.sidebarTokenLinks.map((value) => {
			return (
				<ListItem
					button
					key={value.title}
					className={classes.secondarySubListItem}
					onClick={() => window.open(value.url)}
				>
					{value.title}
				</ListItem>
			);
		});
	};

	const navigate = (path: Route<RootStore, any, {}>) => {
		closeSidebar();
		goTo(path);
	}

	return (
		<Drawer
			variant={window.innerWidth > 960 ? 'persistent' : 'temporary'}
			anchor="left"
			open={sidebarOpen}
			className={classes.drawer}
			onClose={() => closeSidebar()}
		>
			<div className={classes.root}>
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
						<ListItem key="network">
							<ListItemText primary="Current Network" secondary={network.fullName} />
						</ListItem>
						{network.name === NETWORK_LIST.ETH && badgerTree && (
							<ListItem key="rewards">
								<ListItemText
									primary={`Cycle Count: ${badgerTree.cycle}`}
									secondary={
										badgerTree?.timeSinceLastCycle &&
										badgerTree.timeSinceLastCycle + ' since last cycle'
									}
								/>
							</ListItem>
						)}
					</Collapse>

					<ListItem
						button
						onClick={() => {
							navigate(views.home);
						}}
						className={
							classes.listItem + ' ' + (store.router.currentPath === '/' ? classes.activeListItem : '')
						}
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
								className={
									classes.listItem +
									' ' +
									(store.router.currentPath == '/airdrops' ? classes.activeListItem : '')
								}
								onClick={() => navigate(views.airdrops)}
							>
								<ListItemIcon>
									<img
										alt="Badger Airdrop Icon"
										src={'assets/sidebar/airdrop.png'}
										className={classes.icon}
									/>
								</ListItemIcon>
								<ListItemText primary="Airdrops" />
							</ListItem>
							<ListItem
								button
								className={
									classes.listItem +
									' ' +
									(store.router.currentPath == '/digg' ? classes.activeListItem : '')
								}
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
							{FLAGS.IBBTC_FLAG && (
								<ListItem
									button
									className={
										classes.listItem +
										' ' +
										(store.router.currentPath == '/ibBTC' ? classes.activeListItem : '')
									}
									onClick={() => navigate(views.IbBTC)}
								>
									<ListItemIcon>
										<img
											alt="Interest Bearing Badger Bitcoin Icon"
											src={require('assets/sidebar/ibBTC.png')}
											className={classes.icon}
										/>
									</ListItemIcon>
									<ListItemText primary="ibBTC" />
								</ListItem>
							)}
							{FLAGS.BRIDGE_FLAG && (
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
										<img
											src={require('assets/sidebar/icon-badger-bridge.svg')}
											className={classes.icon}
										/>
									</ListItemIcon>
									<ListItemText primary="Bridge" />
								</ListItem>
							)}
							<ListItem
								button
								className={classes.listItem}
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
							<ListItem>
								<Collapse
									in={expanded === 'badger-zone' || store.router.currentPath == '/honey-badger-drop'}
									timeout="auto"
									unmountOnExit
								>
									<ListItem
										button
										className={[
											store.router.currentPath == '/honey-badger-drop'
												? classes.activeListItem
												: '',
											classes.primarySubListItem,
										].join(' ')}
										onClick={() => navigate(views.honeybadgerDrop)}
									>
										Honey Badger Drop
									</ListItem>
								</Collapse>
							</ListItem>
						</>
					) : (
						<></>
					)}
				</List>

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

					{user.viewSettShop && (
						<ListItem
							button
							className={classes.secondaryListItem}
							onClick={() => window.open('http://shop.badger.finance/')}
						>
							Sett Shop
						</ListItem>
					)}

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
						onClick={() => window.open('https://app.gitbook.com/@badger-finance/s/badger-finance/')}
					>
						Docs
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
			</div>
		</Drawer>
	);
});
