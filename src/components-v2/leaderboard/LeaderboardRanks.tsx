import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import LeaderBoardListItem from './LeaderBoardListItem';
import { Grid, ListItem } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { BADGER_TYPE_BOOSTS, BOOST_RANKS } from '../../config/system/boost-ranks';
import { BadgerType } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
	placeholderItem: {
		paddingBottom: '0.25rem',
		paddingTop: '0.25rem',
	},
	placeholderSkeleton: {
		borderRadius: 4,
		height: 56,
		width: '100%',
		[theme.breakpoints.down('xs')]: {
			height: 154,
		},
	},
}));

const LeaderboardRanks = observer(
	(): JSX.Element => {
		const store = useContext(StoreContext);
		const {
			leaderBoard: { ranks },
			user: { accountDetails },
		} = store;
		const classes = useStyles();

		if (!ranks) {
			return (
				<Grid container>
					{BOOST_RANKS.map((rank, index) => (
						<ListItem
							disableGutters
							key={`${rank.name}_${rank.signatureColor}_${index}`}
							className={classes.placeholderItem}
						>
							<Skeleton variant="rect" className={classes.placeholderSkeleton} />
						</ListItem>
					))}
				</Grid>
			);
		}

		const displayRanks = [BadgerType.Frenzy, BadgerType.Hyper, BadgerType.Hero, BadgerType.Neo, BadgerType.Basic];
		let users = 0;
		const leaderboardEntries = displayRanks.map((badgerType, i) => {
			if (i > 0) {
				users += ranks.summary[displayRanks[i - 1]];
			}
			const amount = ranks.summary[badgerType];
			const rankData = BADGER_TYPE_BOOSTS[badgerType];
			const rankStart = rankData.levels[0].multiplier;
			const rankEnd = rankData.levels[rankData.levels.length - 1].multiplier;
			return (
				<LeaderBoardListItem
					key={badgerType}
					name={badgerType.charAt(0).toUpperCase() + badgerType.slice(1)}
					badgersCount={amount}
					rankStart={rankStart}
					rankEnd={rankEnd}
					firstEntryPosition={users + 1}
					lastEntryPosition={users + amount}
					signatureColor={rankData.signatureColor}
					isUserInRank={
						accountDetails
							? accountDetails.boostRank >= rankStart && accountDetails.boostRank <= rankEnd
							: false
					}
				/>
			);
		});

		return <>{leaderboardEntries}</>;
	},
);

export default LeaderboardRanks;
