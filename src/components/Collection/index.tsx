import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../context/store-context';
import {
	Grid,
	Container,
	ButtonGroup,
	Button,
	Paper,
	Dialog,
	DialogTitle,
	Select,
	MenuItem,
	FormControlLabel,
	Switch,
	List,
	ListItem,
	ListItemText
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import _ from 'lodash';
import { VaultStake } from './VaultStake';
import Carousel from 'react-material-ui-carousel'
import { SettList } from './SettList';
import { Wallet } from '../Sidebar/Wallet';

const useStyles = makeStyles((theme) => ({

	root: {
		marginTop: theme.spacing(11),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(28),
			marginTop: theme.spacing(2),
		},
	},
	filters: {
		textAlign: 'left',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'right'
		},
	},
	buttonGroup: {
		marginLeft: theme.spacing(1),

	},
	select: {
		height: '1.8rem',
		fontSize: '.9rem',
		overflow: 'hidden'
	},
	selectInput: {
		margin: 0
	},

	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center'
	},
	before: {
		marginTop: theme.spacing(3),
		width: "100%"
	},
	carousel: {
		overflow: 'inherit',
		marginTop: theme.spacing(1)
	},
	featuredHeader: {
		marginBottom: theme.spacing(2)
	},
	indicatorContainer: {
		display: 'none'
	},
	indicator: {
		fontSize: '11px',
		width: '1rem'
	},
	activeIndicator: {
		fontSize: '11px',
		width: '1rem',
		color: '#fff'
	},
	rewards: {
		marginTop: theme.spacing(1)
	}

}));
export const Collection = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const {
		wallet: { connectedAddress, isCached },
		contracts: { tokens, claimGeysers },
		uiState: { stats, geyserStats, vaultStats, currency, period, setCurrency, setPeriod, treeStats } } = store;

	const [isGlobal, setIsGlobal] = useState<boolean>(false)


	if (!tokens) {
		return <Loader />
	}

	const spacer = () => <div className={classes.before} />;

	const tableHeader = (title: string) => {
		return <>
			<Grid item xs={12} sm={4}>
				<Typography variant="body1" color="textPrimary">
					{title}
				</Typography>

			</Grid>
			<Grid item xs={12} sm={4} md={2}>
				<Typography variant="body2" color="textSecondary">
					Tokens Locked
			</Typography>

			</Grid>
			<Grid item xs={12} sm={4} md={2}>
				<Typography variant="body2" color="textSecondary">
					{({ year: 'Yearly', day: 'Daily', month: 'Monthly' } as any)[period]} ROI

			</Typography>

			</Grid>

			<Grid item xs={12} sm={6} md={2}>
				<Typography variant="body2" color="textSecondary">
					Tokens Locked
			</Typography>

			</Grid>
		</>
	};


	return <>
		<Container className={classes.root} >

			<Grid container spacing={2}>
				{spacer()}

				<Grid item xs={4} style={{ textAlign: 'left' }} >

					<FormControlLabel
						control={
							<Switch
								checked={isGlobal}
								onChange={() => setIsGlobal(!isGlobal)}
								color="primary"
							/>
						}
						label="Hide zero balances"
					/>

				</Grid>
				<Grid item xs={4} style={{ textAlign: 'center' }} >

					{!!connectedAddress && <Button fullWidth variant="contained" color="primary" onClick={() => { claimGeysers(false) }}>Claim {treeStats.claims[0] || "..."} Badger</Button>}

				</Grid>
				<Grid item xs={4} style={{ textAlign: 'right' }} >

					<span className={classes.buttonGroup}>

						<Select
							variant="outlined"
							value={period}
							onChange={(v: any) => setPeriod(v.target.value)}
							className={classes.select}
						>
							<MenuItem value={'day'}>DAY</MenuItem>
							<MenuItem value={'month'}>MONTH</MenuItem>
							<MenuItem value={'year'}>YEAR</MenuItem>
						</Select>
					</span>
					<span className={classes.buttonGroup}>

						<Select
							variant="outlined"
							value={currency}
							onChange={(v: any) => setCurrency(v.target.value)}
							className={classes.select}
						>
							<MenuItem value={'usd'}>USD</MenuItem>
							<MenuItem value={'btc'}>BTC</MenuItem>
							<MenuItem value={'eth'}>ETH</MenuItem>
						</Select>
					</span>

				</Grid>

				{spacer()}

				<Grid item xs={12} md={!!connectedAddress ? 4 : 6} >
					<Paper elevation={2} className={classes.statPaper}>
						<Typography variant="subtitle1" color="textPrimary">TVL</Typography>
						<Typography variant="h5">{stats.stats.tvl}</Typography>
					</Paper>
				</Grid >
				{!!connectedAddress && <Grid item xs={12} md={4}>
					<Paper elevation={2} className={classes.statPaper}>
						<Typography variant="subtitle1" color="textPrimary">Your Portfolio</Typography>
						<Typography variant="h5">{stats.stats.portfolio}</Typography>

					</Paper>
				</Grid>
				}

				<Grid item xs={12} md={!!connectedAddress ? 4 : 6}>
					<Paper elevation={2} className={classes.statPaper}>
						<Typography variant="subtitle1" color="textPrimary">Badger Price</Typography>
						<Typography variant="h5">{stats.stats.badger || "..."}</Typography>
					</Paper>

				</Grid>


				{/* <Grid item xs={12} >
				<Typography variant="body1" color="textPrimary" className={classes.featuredHeader}>Featured</Typography>

				<Carousel
					interval={10000}
					className={classes.carousel}
					navButtonsAlwaysVisible
					indicatorContainerProps={{
						className: classes.indicatorContainer,
						style: {}
					}}
					indicatorProps={{
						className: classes.indicator,
						style: {}
					}}
					activeIndicatorProps={{
						className: classes.activeIndicator,
						style: {}
					}}

				>
				</Carousel>
			</Grid > */}

				<SettList isGlobal={!isCached()} hideEmpty={isGlobal} />

			</Grid >


		</Container >
	</>

});

