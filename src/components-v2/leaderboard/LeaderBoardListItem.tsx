import React from 'react';
import { Box, Typography, ListItem, Grid, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import clsx from 'clsx';
import { BadgerBoostImage } from '../../components/Boost/BadgerBoostImage';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingBottom: '0.25rem',
		paddingTop: '0.25rem',
	},
	boostBadgerContainer: {
		width: 40,
		height: 40,
		marginRight: 8,
		borderRadius: 4,
	},
	leaderboardRow: {
		backgroundColor: theme.palette.background.default,
		padding: theme.spacing(1),
		lineHeight: 1,
		borderRadius: '4px',
		[theme.breakpoints.down('sm')]: {
			padding: theme.spacing(2),
		},
	},
	mobileRow: {
		[theme.breakpoints.down('sm')]: {
			borderTop: `1px solid ${theme.palette.divider}`,
			marginTop: '0.5rem',
			paddingTop: '0.5rem',
		},
	},
	leadingNone: {
		lineHeight: 1,
	},
	usersRank: {
		boxShadow: '0px 0px 8px rgba(242, 165, 43, 0.25)',
		border: '1px solid rgba(242, 165, 43, 0.5)',
		borderRadius: 4,
	},
	rangeText: {
		color: 'rgba(255, 255, 255, 0.3)',
	},
	userRankBadge: {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.common.black,
		fontSize: 9,
		padding: '2px 4px',
		borderRadius: 4,
		marginLeft: 4,
		textTransform: 'uppercase',
		fontWeight: 500,
	},
}));

interface LeaderBoardListItemProps {
	name: string;
	usersAmount: number;
	rankingRangeStart: number;
	rankingRangeEnd: number;
	boostRangeStart: number;
	boostRangeEnd: number;
	signatureColor: string;
	isUserInRank?: boolean;
}

export const LeaderBoardListItem = (props: LeaderBoardListItemProps): JSX.Element => {
	const classes = useStyles();

	const {
		name,
		usersAmount,
		rankingRangeStart,
		rankingRangeEnd,
		boostRangeStart,
		boostRangeEnd,
		signatureColor,
		isUserInRank = false,
	} = props;
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<ListItem disableGutters className={classes.root}>
			<Grid
				container
				alignItems="center"
				className={clsx(classes.leaderboardRow, isUserInRank && classes.usersRank)}
			>
				<Grid item xs={12} md={5} lg={4}>
					<Grid container alignItems="center">
						<Box className={classes.boostBadgerContainer}>
							<BadgerBoostImage signatureColor={signatureColor} />
						</Box>
						<Box>
							<Box display="flex" alignItems="center">
								<Typography variant="body2">{name}</Typography>
								{isUserInRank && <span className={classes.userRankBadge}>YOU</span>}
							</Box>
							<Typography variant="caption" color="textSecondary" className={classes.rangeText}>
								{`${rankingRangeStart} - ${rankingRangeEnd}`}
							</Typography>
						</Box>
					</Grid>
				</Grid>
				<Grid
					className={classes.mobileRow}
					item
					container
					alignItems="center"
					justify="space-between"
					xs={12}
					md
				>
					<>
						{isMobile && <Typography>Badgers</Typography>}
						{usersAmount}
					</>
				</Grid>
				<Grid
					className={classes.mobileRow}
					item
					container
					alignItems="center"
					justify="space-between"
					xs={12}
					md
				>
					<>
						{isMobile && <Typography>Boost Range</Typography>}
						{`${boostRangeStart.toFixed(2)} - ${boostRangeEnd.toFixed(2)}`}
					</>
				</Grid>
			</Grid>
		</ListItem>
	);
};
