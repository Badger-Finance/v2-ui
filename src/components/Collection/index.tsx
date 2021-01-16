import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../context/store-context';
import {
	Grid,
	Container,
	ButtonGroup,
	Button,
	Paper,
	Select,
	MenuItem,
	FormControlLabel,
	Switch,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Tooltip,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';

import { SettList } from './SettList';

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: theme.spacing(11),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(33),
			marginTop: theme.spacing(2),
		},
	},
	filters: {
		textAlign: 'left',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'right',
		},
	},
	buttonGroup: {
		display: 'inline',
		marginRight: theme.spacing(1),
		[theme.breakpoints.up('md')]: {
			marginRight: theme.spacing(0),
			marginLeft: theme.spacing(1),
		},
	},
	select: {
		height: '1.8rem',
		fontSize: '.9rem',
		overflow: 'hidden',
	},
	selectInput: {
		margin: 0,
	},

	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center',
	},
	before: {
		marginTop: theme.spacing(3),
		width: '100%',
	},
	carousel: {
		overflow: 'inherit',
		marginTop: theme.spacing(1),
	},
	featuredHeader: {
		marginBottom: theme.spacing(2),
	},
	indicatorContainer: {
		display: 'none',
	},
	indicator: {
		fontSize: '11px',
		width: '1rem',
	},
	activeIndicator: {
		fontSize: '11px',
		width: '1rem',
		color: '#fff',
	},
	rewards: {
		marginTop: theme.spacing(1),
	},
	rewardItem: {
		padding: 0,
	},
}));
export const Collection = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const {
		wallet: { connectedAddress, isCached },
		contracts: { tokens, claimGeysers },
		uiState: {
			stats,

			currency,
			period,
			setCurrency,
			setPeriod,
			treeStats,
			hideZeroBal,
			setHideZeroBal,
		},
	} = store;

	if (!tokens) {
		return <Loader />;
	}

	const spacer = () => <div className={classes.before} />;

	return (
		<>
			<Container className={classes.root}>
				<Grid container spacing={2} justify="center">
					{spacer()}
					<Grid item xs={12} sm={6}>
						<FormControlLabel
							control={
								<Switch
									checked={hideZeroBal}
									onChange={() => {
										!!connectedAddress && setHideZeroBal(!hideZeroBal);
									}}
									color="primary"
								/>
							}
							label="Wallet balances"
						/>
					</Grid>

					<Grid item xs={12} sm={6} className={classes.filters}>
						<Tooltip
							enterDelay={0}
							leaveDelay={300}
							arrow
							placement="left"
							title="ROI combines the appreciation of the vault with its $BADGER or $DIGG emissions. All numbers are an approximation based on historical data."
						>
							<span className={classes.buttonGroup}>
								<Select
									variant="outlined"
									value={period}
									onChange={(v: any) => setPeriod(v.target.value)}
									className={classes.select}
									style={{ marginTop: 'auto', marginBottom: 'auto' }}
								>
									<MenuItem value={'week'}>WEEK</MenuItem>
									<MenuItem value={'month'}>MONTH</MenuItem>
									<MenuItem value={'year'}>YEAR</MenuItem>
								</Select>
							</span>
						</Tooltip>

						<span className={classes.buttonGroup}>
							<Select
								variant="outlined"
								value={currency}
								onChange={(v: any) => setCurrency(v.target.value)}
								className={classes.select}
								style={{ marginTop: 'auto', marginBottom: 'auto' }}
							>
								<MenuItem value={'month'}>MONTH</MenuItem>
								<MenuItem value={'year'}>YEAR</MenuItem>
							</Select>
						</span>
					</Grid>

					<Grid item xs={12} md={!!connectedAddress ? 4 : 6}>
						<Paper elevation={2} className={classes.statPaper}>
							<Typography variant="subtitle1" color="textPrimary">
								TVL
							</Typography>
							<Typography variant="h5">{stats.stats.tvl}</Typography>
						</Paper>
					</Grid>
					{!!connectedAddress && (
						<Grid item xs={12} md={4}>
							<Paper elevation={2} className={classes.statPaper}>
								<Typography variant="subtitle1" color="textPrimary">
									Your Portfolio
								</Typography>
								<Typography variant="h5">{stats.stats.portfolio}</Typography>
							</Paper>
						</Grid>
					)}

					<Grid item xs={12} md={!!connectedAddress ? 4 : 6}>
						<Paper elevation={2} className={classes.statPaper}>
							<Typography variant="subtitle1" color="textPrimary">
								Badger Price
							</Typography>
							<Typography variant="h5">{stats.stats.badger || '...'}</Typography>
						</Paper>
					</Grid>

					{!!connectedAddress && treeStats.claims.length > 0 && (
						<>
							<Grid item xs={12} style={{ textAlign: 'center', paddingBottom: 0 }}>
								<Typography variant="subtitle1" color="textPrimary">
									Available Rewards:
								</Typography>
							</Grid>
							<Grid item xs={12} md={6}>
								<Paper className={classes.statPaper}>
									{/* {!!connectedAddress && <Button fullWidth variant="contained" color="primary" onClick={() => { claimGeysers(false) }}>Claim {treeStats.claims[0] || "..."} Badger</Button>} */}
									<List style={{ padding: 0 }}>
										{treeStats.claims.map((claim: string, idx: number) => (
											<ListItem className={classes.rewardItem} key={idx}>
												<ListItemText primary={claim} secondary="Badger available to claim" />
												<ListItemSecondaryAction>
													<ButtonGroup size="small" variant="outlined" color="primary">
														<Button
															onClick={() => {
																claimGeysers(false);
															}}
															variant="contained"
														>
															Claim
														</Button>
														{/* <Button onClick={() => { claimGeysers(true) }} >Deposit</Button> */}
													</ButtonGroup>
												</ListItemSecondaryAction>
											</ListItem>
										))}
									</List>
								</Paper>
							</Grid>
						</>
					)}

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

					<SettList isGlobal={!isCached()} hideEmpty={hideZeroBal} />
				</Grid>
			</Container>
		</>
	);
});
