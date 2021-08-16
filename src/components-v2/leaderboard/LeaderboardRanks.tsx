import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import LeaderBoardListItem from './LeaderBoardListItem';
import { Grid, ListItem } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { BOOST_RANKS } from '../../config/system/boost-ranks';

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

		return (
			<>
				{ranks
					.slice()
					.reverse()
					.map((rank, index) => {
						let isUserInRank = false;

						const userBoost = accountDetails?.boost;

						if (userBoost) {
							isUserInRank = rank.levels.some(({ multiplier }) => multiplier === userBoost);
						}

						return (
							<LeaderBoardListItem
								key={`${rank.rangeStart}_${rank.name}_${index}`}
								name={rank.name}
								badgersCount={rank.badgersInRank.length}
								rankStart={rank.rangeStart}
								rankEnd={rank.rangeEnd}
								firstEntryPosition={rank.badgersInRank[0]?.rank}
								lastEntryPosition={rank.badgersInRank[rank.badgersInRank.length - 1]?.rank}
								signatureColor={rank.signatureColor}
								isUserInRank={isUserInRank}
							/>
						);
					})}
			</>
		);
	},
);

export default LeaderboardRanks;
