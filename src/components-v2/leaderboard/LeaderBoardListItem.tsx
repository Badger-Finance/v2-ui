import React from 'react';
import { Box, Typography, ListItem, Grid, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { BoostBadgerAnimation } from '../../components/Boost/BoostBadgerAnimation';
// import { StoreContext } from 'mobx/store-context';
// import { Loader } from 'components/Loader';
// import clsx from 'clsx';
// import { FLAGS } from 'config/constants';

const useStyles = makeStyles((theme) => ({
	root: {
		paddingBottom: '0.25rem',
		paddingTop: '0.25rem',
	},
	boostBadgerContainer: {
		width: '40px',
		marginRight: '8px',
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
}));

export interface LeaderBoardListItemProps {
	value: number;
	rank: string;
	badgers: number;
	rankingRange: Array<number>;
	boostRange: Array<number>;
}

const LeaderBoardListItem = observer(
	(props: LeaderBoardListItemProps): JSX.Element => {
		const classes = useStyles();

		const { value, rank, badgers, rankingRange, boostRange } = props;
		const theme = useTheme();
		const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

		return (
			<ListItem disableGutters className={classes.root}>
				<Grid container alignItems="center" className={classes.leaderboardRow}>
					<Grid item xs={12} md={4}>
						<Box display="flex" alignItems="center">
							<Box className={classes.boostBadgerContainer}>
								<BoostBadgerAnimation value={value} />
							</Box>
							<Box>
								<Typography variant="body1" className={classes.leadingNone}>
									{rank.charAt(0).toUpperCase()} Badgers
								</Typography>
								<Typography variant="caption" color="textSecondary" className={classes.leadingNone}>
									{`${rankingRange[0]} - ${rankingRange[1]}`}
								</Typography>
							</Box>
						</Box>
					</Grid>
					<Grid item xs={12} md={4}>
						<Box
							display="flex"
							alignItems="center"
							justifyContent="space-between"
							className={classes.mobileRow}
						>
							{isMobile && <Typography>Badgers</Typography>}
							{badgers}
						</Box>
					</Grid>
					<Grid item xs={12} md={4}>
						<Box
							display="flex"
							alignItems="center"
							justifyContent="space-between"
							className={classes.mobileRow}
						>
							{isMobile && <Typography>Boost Range</Typography>}
							{`${boostRange[0]} - ${boostRange[1]}`}
						</Box>
					</Grid>
				</Grid>
			</ListItem>
		);
	},
);

export default LeaderBoardListItem;
