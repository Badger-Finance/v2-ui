import {
	Collapse,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemSecondaryAction,
	ListItemText,
} from '@material-ui/core';
import { FLAGS, NETWORK_LIST, SITE_VERSION } from 'config/constants';
import React, { useState } from 'react';

import { ExpandMore } from '@material-ui/icons';
import NetworkWidget from 'components-v2/common/NetworkWidget';
import { StoreContext } from '../../mobx/store-context';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import views from '../../config/routes';

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
		margin: theme.spacing(0, 1),
		width: 'auto',
		border: 0,
		padding: theme.spacing(1, 2),
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
							closeSidebar();
							goTo(views.home);
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
								onClick={() => goTo(views.airdrops)}
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
								onClick={() => goTo(views.digg)}
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
									onClick={() => goTo(views.IbBTC)}
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
									onClick={() => goTo(views.bridge)}
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
