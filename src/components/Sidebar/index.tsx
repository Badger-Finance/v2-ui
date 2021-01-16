import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import { Button, ButtonGroup, List, ListItem, Typography, Drawer, Chip, Collapse, IconButton, ListItemIcon, ListItemText } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import { Wallet } from './Wallet';
import { ExpandMore, LocalGasStation, GetApp, Lock, Timeline } from '@material-ui/icons';
// import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
	logo: {
		height: "2.4rem",
		width: "auto",
		// display: 'block',
		// margin: theme.spacing(2, 2, 0, 2)
	},
	listHeader: {
		fontSize: ".8rem",
		textTransform: "uppercase",
		color: theme.palette.primary.main
	},
	link: {
		color: 'inherit',
		textDecoration: 'none'
	},
	root: {
		padding: theme.spacing(0),
		width: theme.spacing(30),
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		minHeight: "100%"
	},
	drawer: {
	},
	listItem: {
		cursor: "pointer",
		// justifyContent: 'space-between',
		"&:hover": {
			fontWeight: 'bold',
			backgroundColor: theme.palette.background.default

		},
		// paddingLeft: theme.spacing(1),
		padding: theme.spacing(1, 2)
	},
	divider: {
		padding: theme.spacing(2, 2, 1, 2),
		fontSize: '.8rem'
	},
	secondaryListItem: {
		cursor: "pointer",
		justifyContent: 'space-between',
		"&:hover": {
			fontWeight: 'bold'
		},
		// paddingLeft: theme.spacing(1),
		padding: theme.spacing(.5, 2)
	},
	activeListItem: {
		fontWeight: 'bold',
		backgroundColor: theme.palette.background.default
	},

	currency: {
		marginTop: theme.spacing(1)
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
		display: 'inline-block'
	}

}));

export const Sidebar = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const { router: { goTo }, uiState: { sidebarOpen, closeSidebar, stats, gasPrice, setGasPrice }, wallet: { gasPrices } } = store;

	const [expanded, setExpanded] = useState('')

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
				<List >
					<ListItem button className={classes.listItem}>
						<img src={require('../../assets/badger-logo.png')} className={classes.logo} />
						{/* <Chip label="v2.0.0" variant="outlined" color="primary" size="small" /> */}
					</ListItem>
					<ListItem />

					<Wallet />

					<ListItem button className={classes.divider}>
						v2.0.1
					</ListItem>


					<ListItem divider button
						onClick={() => { closeSidebar(); goTo(views.home) }}
						className={classes.listItem + ' ' + (store.router.currentPath === '/' ? classes.activeListItem : '')}>
						<ListItemIcon  >
							<img className={classes.icon} src={require('assets/sidebar/sett.png')} />
						</ListItemIcon>
						<ListItemText primary="Sett Vaults" />

					</ListItem>

					<ListItem divider button className={classes.listItem + ' ' + (store.router.currentPath == '/airdrops' ? classes.activeListItem : '')} onClick={() => goTo(views.airdrops)}>
						<ListItemIcon >
							<img src={require('assets/sidebar/airdrop.png')} className={classes.icon} />
						</ListItemIcon>
						<ListItemText primary="Airdrops" />

					</ListItem>
					<ListItem button disabled className={classes.listItem + ' ' + (store.router.currentPath == '/digg' ? classes.activeListItem : '')} onClick={() => goTo(views.digg)}>

						<ListItemIcon >
							<img src={require('assets/sidebar/digg-white.png')} className={classes.icon} />
						</ListItemIcon>
						<ListItemText primary="Digg" />

						{/* <Chip size="small" label={"Coming soon"} variant="outlined" color="primary" className={classes.rewards} /> */}
					</ListItem>

				</List>

				<List>
					<ListItem button className={classes.secondaryListItem} onClick={() => window.open("https://forum.badger.finance")}>
						Forum
					</ListItem>
					<ListItem button className={classes.secondaryListItem} onClick={() => setExpanded(expanded === 'socials' ? '' : 'socials')}>
						Socials
						<IconButton
							size="small"
							className={classes.expand + " " + (expanded === 'socials' ? classes.expandOpen : '')}
							aria-label="show more"
						>

							<ExpandMore />
						</IconButton>
					</ListItem>

					<Collapse in={expanded === 'socials'} timeout="auto" unmountOnExit>
						<ListItem button className={classes.secondaryListItem} onClick={() => window.open("https://www.twitter.com/badgerdao")} >
							Twitter
						</ListItem>
						<ListItem button className={classes.secondaryListItem} onClick={() => window.open("https://badgerdao.medium.com")} >
							Medium
						</ListItem>
						<ListItem button className={classes.secondaryListItem} onClick={() => window.open("https://discord.com/invite/xSPFHHS")} >
							Discord
						</ListItem>
						<ListItem button className={classes.secondaryListItem} onClick={() => window.open("https://t.me/badger_dao")} >
							Telegram
						</ListItem>
					</Collapse>

					<ListItem button className={classes.secondaryListItem} onClick={() => window.open("https://app.gitbook.com/@badger-finance/s/badger-finance/")}>
						Docs
					</ListItem>
					<ListItem button className={classes.secondaryListItem} onClick={() => window.open("https://badgerdao.medium.com/badger-developer-program-3bf0cb2cc5f1")}>
						Developer Program
					</ListItem>


					<ListItem className={classes.listItem} >
						<ButtonGroup variant="outlined" fullWidth>
							<Button size="small" disabled>
								<img src={require('assets/sidebar/gas.png')} className={classes.icon} />
							</Button>

							{['slow', 'standard', 'rapid'].map((speed: string) =>
								<Button variant={gasPrice === speed ? 'contained' : 'outlined'} size="small" onClick={() => setGasPrice(speed)} >{(gasPrices[speed] / 1).toFixed(0)}</Button>
							)}
						</ButtonGroup>

					</ListItem>
				</List>

			</div>
		</Drawer>
	);
});
