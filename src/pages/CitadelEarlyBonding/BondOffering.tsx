import { Typography, Grid, makeStyles, Card, Paper, Button } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { IBond } from './bonds.config';
import clsx from 'clsx';
import BondPricing from './BondPricing';

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
	opened: {
		backgroundColor: '#66BB6A',
	},
	closed: {
		backgroundColor: '#F44336',
	},
	bondButton: {
		width: '100%',
	},
}));

interface BondOfferingProps {
	bond: IBond;
	select: (bond: IBond) => void;
}

enum SaleStatus {
	Pending = 'Pending',
	Opened = 'Opened',
	Closed = 'Closed',
}

const BondOffering = observer(({ bond, select }: BondOfferingProps): JSX.Element => {
	const { token, address } = bond;
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { prices } = store;

	// TODO: Calcualte or read exchange rate from bond
	const exchangeRate = 10;
	const status = Date.now() % 3 ? SaleStatus.Opened : SaleStatus.Pending;
	const bondStatusIconClass =
		status === SaleStatus.Pending
			? classes.pending
			: status === SaleStatus.Opened
			? classes.opened
			: classes.closed;
	const tokenName = token.toLowerCase();
	return (
		<Card component={Paper}>
			<img className={classes.cardSplash} src={`/assets/img/bond-${tokenName}.png`} />
			<div className={classes.bondContent}>
				<div className={classes.bondTitle}>
					<img
						src={`/assets/icons/${tokenName}.png`}
						className={classes.bondIcon}
						alt=""
						width={23}
						height={23}
					/>
					<Typography variant="body1">{token} Bond</Typography>
					<div className={classes.bondStatus}>
						<Typography variant="caption" className={clsx(classes.bondStatusIcon, bondStatusIconClass)}>
							{status}
						</Typography>
					</div>
				</div>
				<BondPricing token={token} tokenAddress={address} />
				<Button onClick={() => select(bond)} variant="contained" color="primary" className={classes.bondButton} disabled={status !== SaleStatus.Opened}>Bond</Button>
			</div>
		</Card>
	);
});

export default BondOffering;
