import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { List, ListItem, Drawer, Collapse, IconButton, ListItemIcon, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandMore } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
	logo: {
		height: '2.4rem',
		width: 'auto',
		// display: 'block',
		// margin: theme.spacing(2, 2, 0, 2)
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
		// paddingLeft: theme.spacing(1),
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
		// paddingLeft: theme.spacing(1),
		padding: theme.spacing(0.5, 2),
	},
	secondarySubListItem: {
		cursor: 'pointer',
		justifyContent: 'space-between',
		background: ' rgba(0, 0, 0, .2)',
		'&:hover': {},
		// paddingLeft: theme.spacing(1),
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
		uiState: { sidebarOpen, closeSidebar, gasPrice, setGasPrice },
		wallet: { gasPrices },
		rewards: { badgerTree },
	} = store;

	const [expanded, setExpanded] = useState('');

	// const { enqueueSnackbar } = useSnackbar();

	// useEffect(() => {
	// 	if (!!errorMessage)
	// 		enqueueSnackbar(errorMessage, { variant: 'error' })

	// }, [errorMessage])
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
						<img alt="" src={require('../../assets/badger-logo.png')} className={classes.logo} />
						{/* <Chip label="v2.0.0" variant="outlined" color="primary" size="small" /> */}
					</ListItem>

					<ListItem
						button
						onClick={() => setExpanded(expanded === 'advanced' ? '' : 'advanced')}
						style={{ marginTop: '.5rem' }}
						className={classes.listItem}
					>
						v2.3.0
						<IconButton
							size="small"
							className={classes.expand + ' ' + (expanded === 'advanced' ? classes.expandOpen : '')}
							aria-label="show more"
						>
							<ExpandMore />
						</IconButton>
					</ListItem>
					<Collapse in={expanded === 'advanced'} timeout="auto" unmountOnExit>
						<ListItem key="rewards">
							<ListItemText
								primary={`Cycle Count: ${badgerTree.cycle}`}
								secondary={
									badgerTree?.timeSinceLastCycle &&
									badgerTree.timeSinceLastCycle + ' since last cycle'
								}
							/>
						</ListItem>
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
							<img alt="" className={classes.icon} src={require('assets/sidebar/sett.png')} />
						</ListItemIcon>
						<ListItemText primary="Sett Vaults" />
					</ListItem>

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
							<img alt="" src={require('assets/sidebar/airdrop.png')} className={classes.icon} />
						</ListItemIcon>
						<ListItemText primary="Airdrops" />
					</ListItem>
					<ListItem
						button
						className={
							classes.listItem + ' ' + (store.router.currentPath == '/digg' ? classes.activeListItem : '')
						}
						onClick={() => goTo(views.digg)}
					>
						<ListItemIcon>
							<img src={require('assets/sidebar/digg-white.png')} className={classes.icon} />
						</ListItemIcon>
						<ListItemText primary="Digg" />

						{/* <Chip size="small" label={"Coming soon"} variant="outlined" color="primary" className={classes.rewards} /> */}
					</ListItem>
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
							<img src={require('assets/sidebar/nexus_logo_bw.png')} className={classes.icon} />
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
						<ListItem
							button
							className={classes.secondarySubListItem}
							onClick={() => window.open('https://matcha.xyz/markets/BADGER')}
						>
							BADGER
						</ListItem>
						<ListItem
							button
							className={classes.secondarySubListItem}
							onClick={() =>
								window.open('https://info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859')
							}
						>
							Uniswap BADGER/wBTC
						</ListItem>
						<ListItem
							button
							className={classes.secondarySubListItem}
							onClick={() =>
								window.open('https://sushiswap.fi/pair/0x110492b31c59716ac47337e616804e3e3adc0b4a')
							}
						>
							Sushiswap BADGER/wBTC
						</ListItem>
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
