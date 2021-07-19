import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import LeaderBoardListItem from './LeaderBoardListItem';
import { isWithinRange } from '../../mobx/utils/helpers';
import { Grid, ListItem } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { LEADERBOARD_RANKS } from '../../config/constants';

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
					{LEADERBOARD_RANKS.map((rank, index) => (
						<ListItem
							disableGutters
							key={`${rank.name}_${rank.boostRangeStart}_${index}`}
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
				{ranks.map((rank, index) => {
					let isUserInRank = false;
					const userBoost = accountDetails?.boost;
					if (userBoost) {
						isUserInRank = isWithinRange(userBoost, rank.boostRangeStart, rank.boostRangeEnd);
					}
					return (
						<LeaderBoardListItem
							key={`${rank.boostRangeStart}_${rank.name}_${index}`}
							name={rank.name}
							usersAmount={rank.usersAmount}
							rankingRangeStart={rank.firstSlotPosition}
							rankingRangeEnd={rank.lastSlotPosition}
							boostRangeStart={rank.boostRangeStart}
							boostRangeEnd={rank.boostRangeEnd}
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
