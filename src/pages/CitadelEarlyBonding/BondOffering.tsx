import { Typography, Grid, makeStyles, Card, Paper, Link } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { Skeleton } from '@material-ui/lab';
import { StoreContext } from '../../mobx/store-context';
import { IBond } from './bonds.config';
import clsx from 'clsx';

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
	},
	pending: {
		backgroundColor: '#F2BC1B',
	},
	active: {
		backgroundColor: '#66BB6A',
	},
	complete: {
		backgroundColor: '#F44336',
	},
}));

interface EarlyBondMetricProps {
	metric: string;
	value?: string;
}

const EarlyBondMetric = ({ metric, value }: EarlyBondMetricProps): JSX.Element => {
	const classes = useStyles();
	return (
		<>
			<Typography variant="body2" className={classes.metricName}>
				{metric}
			</Typography>
			{value ? <Typography variant="caption">{value}</Typography> : <Skeleton width={35} />}
		</>
	);
};

interface BondOfferingProps {
	bond: IBond;
}

enum SaleStatus {
	Pending = 'Pending',
	Active = 'Ative',
	Complete = 'Complete',
}

const BondOffering = observer(({ bond }: BondOfferingProps): JSX.Element => {
	const { token, address } = bond;
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { prices } = store;

	// TODO: Calcualte or read exchange rate from bond
	const exchangeRate = 10;
	const status = SaleStatus.Pending;
	const bondStatusIconClass =
		status === SaleStatus.Pending
			? classes.pending
			: status === SaleStatus.Active
			? classes.active
			: classes.complete;
	const tokenName = token.toLowerCase();
	console.log(`/assets/img/bond-${tokenName}.png`);
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
				<Grid container spacing={2} className={classes.bondInfo}>
					<Grid item xs={6}>
						<EarlyBondMetric metric="Price" value={'10'} />
					</Grid>
					<Grid item xs={6}>
						<EarlyBondMetric metric="Bond Rate" value={`${exchangeRate} CTDL / ${token}`} />
					</Grid>
				</Grid>
				<Link className={classes.bondLink} href="/">
					View Details
				</Link>
			</div>
		</Card>
	);
});

export default BondOffering;
