import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { StoreContext } from '../../mobx/store-context';
import {
	Tooltip,
	Card,
	CardContent,
	CardActions,
	CardActionArea,
	Collapse,
	Avatar,
	IconButton,
	Divider,
	Button,
	Grid,
	ButtonGroup,
	Chip,
	LinearProgress,
	CircularProgress,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import { BigNumber } from 'bignumber.js';
import { VaultSymbol } from '../VaultSymbol';
import { LinkOff } from '@material-ui/icons';
import { formatBalance, formatBalanceValue, formatGrowth, formatHoldingsValue } from 'mobx/reducers/statsReducers';

const useStyles = makeStyles((theme) => ({
	featuredImage: {
		margin: theme.spacing(0, 'auto', 2, 'auto'),
		display: 'block',
		borderRadius: theme.shape.borderRadius * 2,
		maxHeight: '425px',
		maxWidth: '805px',
		width: '100%',
	},
	card: {
		overflow: 'hidden',

		padding: theme.spacing(0, 2, 2, 2),
	},
	fade: {
		position: 'absolute',
		right: 0,
		bottom: 0,
	},
	buttons: {
		textAlign: 'right',
	},
	button: {
		marginLeft: theme.spacing(1),
	},
	border: {
		borderBottom: `1px solid ${theme.palette.background.default}`,
		padding: theme.spacing(2, 2),
		alignItems: 'center',
		overflow: 'hidden',
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
		boxShadow: theme.shadows[1],
	},
	name: {
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(2),
		},
	},
	chip: {
		marginLeft: theme.spacing(1),
		padding: 0,
	},
	cardActions: {
		float: 'right',
		zIndex: 1000,
		position: 'relative',
		[theme.breakpoints.down('sm')]: {
			marginTop: theme.spacing(1),
		},
	},
}));
export const TokenCard = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { vault,
		isGlobal,
		onDeposit,
		onWithdraw } = props;

	const {
		period,
		currency
	} = store.uiState

	const { underlyingToken: token } = vault;

	if (!token) {
		return <div />;
	}

	const { total, tooltip } = formatGrowth(vault, period)

	return (
		<>
			<Grid container className={classes.border}>
				<Grid item xs={12} md={4} className={classes.name}>
					<VaultSymbol token={token} />
					<Typography variant="body1">{token.symbol}</Typography>

					<Typography variant="body2" color="textSecondary" component="div">
						{token.symbol}
						{/* {!!token.isSuperSett && (
							<Chip className={classes.chip} label="Harvest" size="small" color="primary" />
						)} */}
					</Typography>
				</Grid>

				<Grid item className={classes.mobileLabel} xs={6}>
					<Typography variant="body2" color={'textSecondary'}>
						{!isGlobal ? 'Tokens Available' : 'Tokens Deposited'}
					</Typography>
				</Grid>

				<Grid item xs={6} md={2}>
					<Typography
						variant="body1"
						color={'textPrimary'}
					>
						{!isGlobal ? formatBalance(token) : formatBalance(vault)}
					</Typography>

				</Grid>
				<Grid item className={classes.mobileLabel} xs={6}>
					<Typography variant="body2" color={'textSecondary'}>
						{!isGlobal ? 'Potential ROI' : 'ROI'}
					</Typography>
				</Grid>
				<Grid item xs={6} md={2}>
					<Tooltip enterDelay={0} leaveDelay={300} arrow placement="left" title={token.vaults.length}>
						<Typography
							style={{ cursor: 'default' }}
							variant="body1"
							color={'textPrimary'}
						>
							{token.vaults.length}
						</Typography>
					</Tooltip>
				</Grid>
				<Grid item className={classes.mobileLabel} xs={6}>
					<Typography variant="body2" color={'textSecondary'}>
						Value
					</Typography>
				</Grid>
				<Grid item xs={6} md={2}>
					<Typography variant="body1" color={'textPrimary'}>
						{!isGlobal ? formatBalanceValue(vault, currency) : formatHoldingsValue(vault, currency)}
					</Typography>
				</Grid>

				<Grid item xs={12} md={2}>
					<ButtonGroup variant="outlined" className={classes.cardActions}>
						{token.balance.gt(0) && (
							<Button
								onClick={() => onDeposit({ token, vault })}
								variant={'outlined'}
								color="primary"
								size="small"
							>
								DEPOSIT
							</Button>
						)}
						{vault.balance.gt(0) && (
							<Button
								onClick={() => onWithdraw({ token, vault })}
								variant={'outlined'}
								color="primary"
								size="small"
							>
								WITHDRAW
							</Button>
						)}


					</ButtonGroup>
				</Grid>
			</Grid>
		</>
	);
});
