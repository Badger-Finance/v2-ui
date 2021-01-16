import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { StoreContext } from '../../context/store-context';
import {
	Tooltip,
	Card, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton, Divider, Button, Grid, ButtonGroup, Chip, LinearProgress
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import { BigNumber } from 'bignumber.js'
import { VaultSymbol } from '../VaultSymbol';
import { LinkOff } from '@material-ui/icons';

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
	},
	buttons: {
		textAlign: "right"
	},
	button: {
		marginLeft: theme.spacing(1)
	},
	border: {
		borderBottom: `1px solid ${theme.palette.background.default}`,
		padding: theme.spacing(2, 2),
		alignItems: 'center',
		overflow: 'hidden'
	},
	mobileLabel: {
		textAlign: 'right',
		paddingRight: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			display: 'none',
		},
	},
	featured: {
		border: 0,
		// paddingTop: '30%',
		background: theme.palette.background.paper,
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
	},
	cardActions: {
		float: "right", zIndex: 1000, position: 'relative',
		[theme.breakpoints.down('sm')]: {
			marginTop: theme.spacing(1)
		},
	}

}));
export const AssetCard = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const { onStake,
		onUnstake,
		onUnwrap,
		uiStats,
		isFeatured,
		isGlobal,
		isDeposit } = props

	const { stats, token } = uiStats

	if (!stats || !stats.vault) {
		return <LinearProgress />
	}

	return <>
		<Grid container className={classes.border + (isFeatured ? ` ${classes.featured}` : '')}>

			<Grid item xs={12} md={4} className={classes.name}>
				<VaultSymbol token={token} />
				<Typography variant="body1">
					{stats.name}

				</Typography>

				<Typography variant="body2" color="textSecondary" component="div">
					{token.symbol}
					{!!stats.vault.isSuperSett && <Chip className={classes.chip} label="Super Sett" size="small" color="primary" />}
				</Typography>

			</Grid>

			<Grid item className={classes.mobileLabel} xs={6}>
				<Typography variant="body2" color={"textSecondary"}>
					{!isGlobal ?
						!isDeposit ?
							'Tokens Available' : 'Tokens Deposited'
						: 'Tokens Locked'}
				</Typography>
			</Grid>

			<Grid item xs={6} md={2}>
				<Typography variant="body1" color={parseFloat(stats.underlyingBalance) === 0 ? "textSecondary" : 'textPrimary'}>

					{!isGlobal ?
						!isDeposit ?
							stats.availableBalance : stats.yourBalance
						: stats.underlyingTokens}
				</Typography>
				{/* <Typography variant="body2" color="textSecondary">
					{stats.underlyingTokens}
					{stats.underlyingBalance}

				</Typography> */}

			</Grid>
			<Grid item className={classes.mobileLabel} xs={6}>
				<Typography variant="body2" color={"textSecondary"}>

					{!isDeposit && !isGlobal ? "Potential ROI" : "ROI"}
				</Typography>
			</Grid>
			<Grid item xs={6} md={2}>
				<Tooltip enterDelay={0} leaveDelay={300} arrow placement="left" title={stats.tooltip}>

					<Typography style={{ cursor: 'default' }} variant="body1" color={(!isDeposit && !isGlobal) ? 'textSecondary' : 'textPrimary'} >

						{stats.growth || '...'}

					</Typography>
				</Tooltip>

			</Grid>
			<Grid item className={classes.mobileLabel} xs={6}>

				<Typography variant="body2" color={"textSecondary"}>

					Value
				</Typography>
			</Grid>
			<Grid item xs={6} md={2}>
				<Typography variant="body1" color={'textPrimary'}>

					{!isGlobal ? stats.yourValue : stats.underlyingBalance}
				</Typography>
			</Grid>

			<Grid item xs={12} md={2}>
				<ButtonGroup variant="outlined" className={classes.cardActions}>

					{!!stats.anyUnderlying && !stats.anyWrapped &&
						<Button onClick={() => onStake({ stats, token })}
							variant={'outlined'} color="primary" size="small" >
							DEPOSIT</Button>}

					{!!stats.anyWrapped && !isDeposit &&
						<Button onClick={() => onStake({ stats, token })}
							variant={(stats.anyUnderlying || stats.anyWrapped) ? 'contained' : 'outlined'} color="primary" size="small" >
							STAKE</Button>}

					{isDeposit && !!stats.anyStaked &&
						<Button onClick={() => onUnstake({ stats, token })}
							variant="outlined" color="primary" size="small" className={classes.button}>
							WITHDRAW</Button>}

					{!!stats.anyWrapped && !isDeposit &&
						<Button onClick={() => onUnwrap({ stats, token })}
							variant="outlined" color="primary" size="small" className={classes.button}>
							WITHDRAW</Button>}

				</ButtonGroup>


			</Grid>
		</Grid>

	</>


});

