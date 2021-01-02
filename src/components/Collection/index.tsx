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
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import { VaultCard } from './VaultCard';
import _ from 'lodash';
import { VaultStake } from './VaultStake';
import Carousel from 'react-material-ui-carousel'
import { SettList } from './SettList';

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
		marginRight: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			marginLeft: theme.spacing(2),
			marginRight: theme.spacing(0),

		},
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
	}

}));
export const Collection = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const {
		wallet: { connectedAddress },
		contracts: { tokens },
		uiState: { stats, geyserStats, vaultStats, currency, period, setCurrency, setPeriod } } = store;


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


	return <Container className={classes.root} >
		<Grid container spacing={2}>
			{spacer()}

			<Grid item xs={12} sm={4} >
				<Typography variant="h5" color="textPrimary" >Badger Setts</Typography>
				<Typography variant="subtitle2" color="textPrimary" >Deposit & Earn on your Bitcoin</Typography>
			</Grid>

			<Grid item xs={12} sm={8} className={classes.filters}>

				<ButtonGroup variant="outlined" size="small" className={classes.buttonGroup}>
					{["btc", "eth", "usd"].map((curr: string) =>
						<Button key={curr} color={currency === curr ? 'primary' : 'default'} onClick={() => setCurrency(curr)}>{curr}</Button>
					)}
				</ButtonGroup>

				<ButtonGroup variant="outlined" size="small" className={classes.buttonGroup}>
					{["day", "month", "year"].map((p: string) =>
						<Button key={p} color={period === p ? 'primary' : 'default'} onClick={() => setPeriod(p)}>{p.charAt(0)}</Button>
					)}
				</ButtonGroup >

			</Grid >


			<Grid item xs={12} md={!!connectedAddress ? 4 : 6} >
				<Paper className={classes.statPaper}>
					<Typography variant="subtitle1" color="textPrimary">TVL</Typography>
					<Typography variant="h5">{stats.tvl}</Typography>
				</Paper>
			</Grid >
			{!!connectedAddress && <Grid item xs={12} md={4}>
				<Paper className={classes.statPaper}>
					<Typography variant="subtitle1" color="textPrimary">Your Portfolio</Typography>
					<Typography variant="h5">{stats.portfolio}</Typography>
				</Paper> 			</Grid>
			}

			<Grid item xs={12} md={!!connectedAddress ? 4 : 6}>
				<Paper className={classes.statPaper}>
					<Typography variant="subtitle1" color="textPrimary">Badger Price</Typography>
					<Typography variant="h5">{stats.badger || "..."}</Typography>
				</Paper>

			</Grid>
			{spacer()}


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

			<SettList isGlobal />

		</Grid >


	</Container >

});

