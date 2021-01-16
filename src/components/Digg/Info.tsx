import { Grid, Typography, Paper, makeStyles, Button } from '@material-ui/core';
import React, { useState, useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import useInterval from '@use-it/interval';
import { observer } from 'mobx-react-lite';
import { Loader } from '../Loader';
import { calculateNewSupply, shortenNumbers, numberWithCommas } from '../../mobx/utils/digHelpers';

const useStyles = makeStyles((theme) => ({
	before: {
		marginTop: theme.spacing(3),
		width: '100%',
	},
	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center',
	},
}));

const Info = observer(() => {
	const store = useContext(StoreContext);
	const {
		uiState: { rebaseStats },
	} = store;
	const classes = useStyles();

	const [nextRebase, setNextRebase] = useState('00:00:00');
	const newSupply =
		rebaseStats.oracleRate && rebaseStats.totalSupply
			? calculateNewSupply(
					rebaseStats.oracleRate.toNumber(),
					rebaseStats.totalSupply.toNumber(),
					rebaseStats.rebaseLag,
			  )
			: 0;
	const isPositive = !newSupply || newSupply >= rebaseStats.totalSupply;
	const percentage =
		newSupply && rebaseStats.totalSupply
			? ((newSupply - rebaseStats.totalSupply) / rebaseStats.totalSupply) * 100
			: 0;

	if (!rebaseStats) {
		return <Loader />;
	}

	useInterval(() => {
		if (!!rebaseStats && !!rebaseStats.nextRebase) {
			const zero = new Date(0);

			zero.setTime(rebaseStats.nextRebase.getTime() - new Date().getTime());
			setNextRebase(zero.toISOString().substr(11, 8));
		}
	}, 1000);

	const spacer = () => <div className={classes.before} />;

	return (
		<>
			<Grid item xs={12} md={3}>
				<Paper className={classes.statPaper}>
					<Typography variant="subtitle1">Next Rebase</Typography>
					<Typography variant="h5">{nextRebase || '...'}</Typography>
				</Paper>
			</Grid>
			<Grid item xs={6} md={3}>
				<Paper className={classes.statPaper}>
					<Typography variant="subtitle1">Oracle rate</Typography>
					<Typography variant="h5">{shortenNumbers(rebaseStats.oracleRate, '₿', 5) || '...'}</Typography>
				</Paper>
			</Grid>
			<Grid item xs={6} md={3}>
				<Paper className={classes.statPaper}>
					<Typography variant="subtitle1">Price target</Typography>
					<Typography variant="h5">₿ 1.00000</Typography>
				</Paper>
			</Grid>
			<Grid item xs={12} md={3}>
				<Paper className={classes.statPaper}>
					<Typography variant="subtitle1">Total Supply</Typography>
					<Typography variant="h5">{shortenNumbers(rebaseStats.totalSupply, '', 2) || '...'}</Typography>
				</Paper>
			</Grid>
			<Grid item xs={12}>
				<Paper className={classes.statPaper}>
					<Typography variant="subtitle1">
						Supply After Rebase {isPositive ? '+' : '-'}{' '}
						{percentage ? Math.abs(percentage).toFixed(2) + '%' : ''}{' '}
					</Typography>
					<Typography variant="h4" style={{ color: isPositive ? 'green' : 'red' }}>
						{numberWithCommas(newSupply.toFixed(2)) || '...'}
					</Typography>
					{spacer()}

					<Button size="large" variant="contained" color="primary">
						Rebase
					</Button>
				</Paper>
			</Grid>
		</>
	);
});

export default Info;
