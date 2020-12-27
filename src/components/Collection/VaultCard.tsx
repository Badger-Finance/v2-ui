import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { StoreContext } from '../../context/store-context';
import {
	Tooltip,
	Card, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton, Divider, Button, Grid, ButtonGroup, Chip
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import { BigNumber } from 'bignumber.js'
import { VaultSymbol } from '../VaultSymbol';

const useStyles = makeStyles((theme) => ({
	featuredImage: {
		margin: theme.spacing(0, 'auto', 2, 'auto'),
		display: 'block',
		borderRadius: theme.shape.borderRadius * 2,
		maxHeight: "425px",
		maxWidth: "805px",
		width: "100%"
	},
	card: {
		overflow: 'hidden',

		padding: theme.spacing(0, 2, 2, 2)
	},
	fade: {
		position: 'absolute',
		right: 0,
		bottom: 0
	}
	, buttons: {
		textAlign: "right"
	},
	button: {
		marginLeft: theme.spacing(1)
	},
	border: {
		borderBottom: `1px solid ${theme.palette.grey[800]}`,
		// marginTop: "-1px",
		// borderRadius: theme.shape.borderRadius,
		padding: theme.spacing(2, 2),
		alignItems: 'center',
		overflow: 'hidden'
	},
	mobileLabel: {
		[theme.breakpoints.up('md')]: {
			display: 'none',
		},
	},
	featured: {
		border: 0,
		// paddingTop: '30%',
		background: theme.palette.grey[800],
		borderRadius: theme.shape.borderRadius,
		boxShadow: theme.shadows[1]
	},
	name: {
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(2)
		},
	},
	chip: {
		marginLeft: theme.spacing(1),
		padding: 0
	}

}));
export const VaultCard = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { onStake,
		onUnstake,
		onUnwrap,
		uiStats,
		isFeatured,
		isGlobal,
		isDeposit } = props

	const { uiState: { collection } } = store;



	if (!uiStats) {
		return <Loader />
	}
	let isSuperSett = collection.superSett.includes(uiStats.address)
	let anyAvailable = !!uiStats.availableBalance && parseFloat(uiStats.availableBalance) !== 0
	return <>
		<Grid container className={classes.border + (isFeatured ? ` ${classes.featured}` : '')}>
			{!!isFeatured && <Grid item xs={12} sm={12}>
				<img className={classes.featuredImage} src={require(`../../assets/featured-setts/${uiStats.symbol.toLowerCase().replace('/', '')}.png`)} />

			</Grid>}
			<Grid item xs={12} md={4} className={classes.name}>
				<VaultSymbol symbol={uiStats.symbol} />
				<Typography variant="body1">
					{uiStats.name}
				</Typography>

				<Typography variant="body2" color="textSecondary" component="div">
					{uiStats.symbol}
					{!!isSuperSett && <Chip className={classes.chip} label="Super Sett" size="small" color="primary" />}

				</Typography>

			</Grid>

			<Grid item className={classes.mobileLabel} xs={6}>
				<Typography variant="body2" color={"textSecondary"}>

					Tokens Locked
				</Typography>
			</Grid>

			<Grid item xs={6} md={2}>
				<Typography variant="body1" color={parseFloat(uiStats.underlyingBalance) === 0 ? "textSecondary" : 'textPrimary'}>

					{!isGlobal ? uiStats.availableBalance : uiStats.underlyingTokens}
				</Typography>
				{/* <Typography variant="body2" color="textSecondary">
					{uiStats.underlyingTokens}
					{uiStats.underlyingBalance}

				</Typography> */}

			</Grid>
			<Grid item className={classes.mobileLabel} xs={6}>
				<Typography variant="body2" color={"textSecondary"}>

					ROI
				</Typography>
			</Grid>
			<Grid item xs={6} md={2}>
				<Tooltip arrow placement="left" title={`${uiStats.geyserGrowth} + ${uiStats.vaultGrowth} ${uiStats.symbol} `}>

					<Typography variant="body1" >

						{uiStats.growth || '...'}

					</Typography>
				</Tooltip>

				{/* <Typography variant="body2" color="textSecondary">
					{!!uiStats.vaultGrowth && '+'} {uiStats.vaultGrowth}

				</Typography> */}

			</Grid>
			<Grid item className={classes.mobileLabel} xs={6}>

				<Typography variant="body2" color={"textSecondary"}>

					Value
				</Typography>
			</Grid>
			<Grid item xs={6} md={2}>
				<Typography variant="body1" color={!anyAvailable && false ? "textSecondary" : 'textPrimary'}>

					{!isGlobal ? uiStats.yourValue : uiStats.underlyingBalance}
				</Typography>
				{/* <Typography variant="body2" color="textSecondary">


				</Typography> */}
			</Grid>

			<Grid item xs={12} md={2}>
				<ButtonGroup variant="outlined" style={{ float: "right", zIndex: 1000, position: 'relative' }}>
					{isDeposit && <Button onClick={() => onUnstake(uiStats.address)} variant="outlined" color="primary" size="small" className={classes.button}>Unstake</Button>}
					{!isDeposit && <Button onClick={() => onStake(uiStats.address)} variant={anyAvailable ? 'contained' : 'outlined'} color="primary" size="small" >Stake</Button>}
					{!!uiStats.anyWrapped && <Button onClick={() => onUnwrap(uiStats.address)} variant="outlined" color="primary" size="small" className={classes.button}>Unwrap</Button>}

				</ButtonGroup>


			</Grid>
		</Grid>

	</>


});

