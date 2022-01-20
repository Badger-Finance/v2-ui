import { Typography, makeStyles, Card, Paper, Button, Grid } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { CitadelBond, SaleStatus } from './bonds.config';
import clsx from 'clsx';
import BondPricing, { EarlyBondMetric } from './BondPricing';
import { StoreContext } from 'mobx/store-context';
import { inCurrency } from 'mobx/utils/helpers';
import BigNumber from 'bignumber.js';
import { Currency } from 'config/enums/currency.enum';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';

const useStyles = makeStyles((theme) => ({
	cardSplash: {
		width: '100%',
	},
	bondContent: {
		padding: '21px',
	},
	bondIcon: {
		marginRight: theme.spacing(2),
	},
	bondTitle: {
		display: 'flex',
		alignItems: 'center',
		marginBottom: theme.spacing(3),
		cursor: 'default',
	},
	metricName: {
		textTransform: 'uppercase',
		letterSpacing: '0.0025em',
		fontWeight: 'normal',
		fontSize: '14px',
		lineHeight: '20px',
		color: '#C3C3C3',
	},
	bondInfo: {
		marginBottom: theme.spacing(3),
	},
	bondLink: {
		paddingTop: theme.spacing(3),
	},
	bondStatus: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		flexGrow: 1,
		textTransform: 'uppercase',
	},
	bondStatusIcon: {
		paddingLeft: theme.spacing(0.75),
		paddingRight: theme.spacing(0.75),
		paddingTop: theme.spacing(0.25),
		paddingBottom: theme.spacing(0.25),
		borderRadius: '40px',
		minWidth: '65px',
		display: 'flex',
		justifyContent: 'center',
		lineHeight: '25px',
		fontSize: '12px',
		letterSpacing: '0.25px',
		fontWeight: 'bold',
	},
	pending: {
		backgroundColor: '#FF7C33',
	},
	open: {
		backgroundColor: '#66BB6A',
	},
	closed: {
		backgroundColor: '#F44336',
	},
	bondButton: {
		width: '100%',
	},
	bondPricing: {
		marginBottom: theme.spacing(3),
	},
}));

interface BondOfferingProps {
	bond: CitadelBond;
	select: (bond: CitadelBond) => void;
	status: SaleStatus;
}

const BondOffering = observer(({ bond, select, status }: BondOfferingProps): JSX.Element => {
	const { prices, user, bondStore } = useContext(StoreContext);
	const { purchasedTokens, purchasedTokensValue, purchasedBonds, purchasedBondsValue } = bondStore.getBondInfo(bond);
	const { bondToken, claimed } = bond;

	// const bondTokenPrice = prices.getPrice(bond.address);
	const bondTokenPrice = prices.getPrice(ETH_DEPLOY.tokens.wBTC);
	const bondTokenBalance = user.getTokenBalance(bond.address);
	const classes = useStyles();

	const bondStatusIconClass =
		status === SaleStatus.Pending ? classes.pending : status === SaleStatus.Open ? classes.open : classes.closed;
	const tokenName = bondToken.symbol.toLowerCase();

	const buttonText = status === SaleStatus.Closed ? 'Claim' : `Bond ${bondToken.symbol}`;
	const cannotBond = status === SaleStatus.Open && bondTokenBalance.tokenBalance.eq(0);
	const cannotClaim = status === SaleStatus.Closed && (claimed || purchasedTokens === 0);

	// TODO: Add loading of user data (beneficiary whitelist) for distabled check
	return (
		<Card component={Paper}>
			<img className={classes.cardSplash} src={`/assets/img/bond-${tokenName}.png`} alt={`${bondToken.name}`} />
			<div className={classes.bondContent}>
				<div className={classes.bondTitle}>
					<img
						src={`/assets/icons/${tokenName}.png`}
						className={classes.bondIcon}
						alt={`${bondToken.name}`}
						width={23}
						height={23}
					/>
					<Typography variant="body1">{bondToken.name} Bond</Typography>
					<div className={classes.bondStatus}>
						<Typography variant="caption" className={clsx(classes.bondStatusIcon, bondStatusIconClass)}>
							{status}
						</Typography>
					</div>
				</div>
				<div className={classes.bondPricing}>
					<BondPricing bond={bond} />
					<Grid container spacing={2}>
						<Grid item xs={6}>
							<EarlyBondMetric
								metric="Your Tokens"
								value={`${purchasedTokens.toFixed(2)} CTDL`}
								subvalue={inCurrency(new BigNumber(purchasedTokensValue), Currency.USD)}
							/>
						</Grid>
						<Grid item xs={6}>
							<EarlyBondMetric
								metric="Total Bonded"
								value={`${purchasedBonds.toFixed(2)} ${bondToken.symbol}`}
								subvalue={inCurrency(purchasedBondsValue, Currency.USD)}
							/>
						</Grid>
					</Grid>
				</div>
				<Button
					onClick={() => {
						if (status === SaleStatus.Open) {
							select(bond);
						} else if (status === SaleStatus.Closed) {
						}
					}}
					variant="contained"
					color="primary"
					className={classes.bondButton}
					disabled={cannotBond || cannotClaim}
				>
					{buttonText}
				</Button>
			</div>
		</Card>
	);
});

export default BondOffering;
