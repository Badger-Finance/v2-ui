import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import {
	Tooltip,
	IconButton,
	Grid,
	Chip,

} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { VaultSymbol } from '../Common/VaultSymbol';
import { UnfoldMoreTwoTone } from '@material-ui/icons';
import {
	formatBalance,
	formatBalanceValue,
	formatGeyserHoldings,
	formatHoldingsValue,
	formatVaultGrowth,
} from 'mobx/reducers/statsReducers';

const useStyles = makeStyles((theme) => ({

	border: {
		borderBottom: `1px solid ${theme.palette.background.default}`,
		padding: theme.spacing(2, 2),
		alignItems: 'center',
		overflow: 'hidden',
		transition: '.2s background ease-out',
		cursor: 'pointer',
		'&:hover': {
			background: '#3a3a3a',
		},
		'&:active': {
			background: theme.palette.background.default,
		},
	},
	mobileLabel: {
		textAlign: 'right',
		paddingRight: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			display: 'none',
		},
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
}));
export const TokenCard = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { vault, isGlobal, onOpen } = props;

	const { period, currency } = store.uiState;

	const { underlyingToken: token } = vault;

	if (!token || !vault.geyser) {
		return <div />;
	}
	// const [update, forceUpdate] = useState<boolean>();
	// useInterval(() => forceUpdate(!update), 1000);

	const { roi, roiTooltip } = formatVaultGrowth(vault, period);

	return (
		<>
			<Grid onClick={() => onOpen(vault)} container className={classes.border}>
				<Grid item xs={12} md={4} className={classes.name}>
					<VaultSymbol token={token} />
					<Typography variant="body1">{token.name}</Typography>

					<Typography variant="body2" color="textSecondary" component="div">
						{token.symbol}
						{!!vault.super && (
							<Chip className={classes.chip} label="Harvest" size="small" color="primary" />
						)}
					</Typography>
				</Grid>

				<Grid item className={classes.mobileLabel} xs={6}>
					<Typography variant="body2" color={'textSecondary'}>
						{!isGlobal ? 'Tokens Available' : 'Tokens Deposited'}
					</Typography>
				</Grid>

				<Grid item xs={6} md={2}>
					<Typography variant="body1" color={'textPrimary'}>
						{!isGlobal ? formatBalance(token) : formatGeyserHoldings(vault.geyser)}
					</Typography>
				</Grid>
				<Grid item className={classes.mobileLabel} xs={6}>
					<Typography variant="body2" color={'textSecondary'}>
						{!isGlobal ? 'Potential ROI' : 'ROI'}
					</Typography>
				</Grid>
				<Grid item xs={6} md={2}>
					<Tooltip enterDelay={0} leaveDelay={300} arrow placement="left" title={roiTooltip}>
						<Typography style={{ cursor: 'default' }} variant="body1" color={'textPrimary'}>
							{isNaN(parseFloat(roi)) ? '0.00%' : roi}
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
						{!isGlobal
							? formatBalanceValue(vault.underlyingToken, currency)
							: formatHoldingsValue(vault, currency)}
					</Typography>
				</Grid>

				<Grid item xs={12} md={2} style={{ textAlign: 'right' }}>
					<IconButton color={vault.balance.gt(0) || token.balance.gt(0) ? 'default' : 'secondary'}>
						<UnfoldMoreTwoTone />
					</IconButton>
				</Grid>
			</Grid>
		</>
	);
});
