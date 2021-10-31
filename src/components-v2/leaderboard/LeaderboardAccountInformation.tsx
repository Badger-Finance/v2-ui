import React, { useContext } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Skeleton } from '@material-ui/lab';
import BoostSuggestion from './BoostSuggestion';
import NativeRankSuggestion from './NativeRankSuggestion';
import ViewBoostButton from './ViewBoostButton';

const useStyles = makeStyles((theme) => ({
	justifyCenterOnMobile: {
		[theme.breakpoints.down('xs')]: {
			justifyContent: 'center',
		},
	},
	boostContainer: {
		[theme.breakpoints.down('xs')]: {
			textAlign: 'center',
			marginBottom: 16,
		},
	},
	headerValueText: {
		marginLeft: theme.spacing(1),
	},
	infoContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
	},
}));

const LeaderboardAccountInformation = observer(
	(): JSX.Element => {
		const { user, wallet } = useContext(StoreContext);
		const classes = useStyles();

		const boost = user.accountDetails?.boost;
		const rank = user.accountDetails?.boostRank;

		// Show N/A when wallet is not connected otherwise show loading skeleton
		const infoPlaceholder = !wallet.address ? 'N/A' : <Skeleton width={30} />;

		return (
			<Grid container>
				<Grid item container alignItems="center" xs={12} sm className={classes.boostContainer}>
					<Grid container item xs={12} alignItems="center" className={classes.justifyCenterOnMobile}>
						<Typography variant="h2" display="inline">
							Boost:
						</Typography>
						<Typography variant="h2" display="inline" className={classes.headerValueText}>
							{boost !== undefined ? `${boost}x` : infoPlaceholder}
						</Typography>
					</Grid>
					<Grid container item xs={12} alignItems="center" className={classes.justifyCenterOnMobile}>
						<Typography variant="h6" color="textSecondary" display="inline">
							Rank:
						</Typography>
						<Typography
							variant="h6"
							color="textSecondary"
							display="inline"
							className={classes.headerValueText}
						>
							{rank !== undefined ? rank : infoPlaceholder}
						</Typography>
					</Grid>
				</Grid>
				<div className={classes.infoContainer}>
					<ViewBoostButton />
					<BoostSuggestion />
					<NativeRankSuggestion />
				</div>
			</Grid>
		);
	},
);

export default LeaderboardAccountInformation;
