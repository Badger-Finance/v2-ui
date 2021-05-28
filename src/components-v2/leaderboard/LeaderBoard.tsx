import React, { useContext } from 'react';
import {
	Table,
	TableContainer,
	TableHead,
	TableRow,
	TableBody,
	makeStyles,
	TablePagination,
	Paper,
	Link,
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { observer } from 'mobx-react-lite';
import { LeaderBoardCell } from './styles';
import { StoreContext } from 'mobx/store-context';
import { Loader } from 'components/Loader';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	leaderboardPaper: {
		paddingTop: theme.spacing(2),
		marginBottom: theme.spacing(5),
		[theme.breakpoints.down('sm')]: {
			marginTop: theme.spacing(2),
			paddingTop: theme.spacing(1),
		},
	},
	pageContainer: {
		marginTop: theme.spacing(1),
		paddingBottom: theme.spacing(2),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		[theme.breakpoints.down('sm')]: {
			marginTop: theme.spacing(2),
		},
	},
	paginationButton: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
	},
	viewButton: {
		marginLeft: theme.spacing(4),
		fontSize: '.8rem',
		[theme.breakpoints.down('sm')]: {
			marginLeft: theme.spacing(2),
		},
	},
	headerRow: {
		marginBottom: theme.spacing(1),
	},
	headerText: {
		fontSize: '1.3rem',
		paddingBottom: theme.spacing(2),
		[theme.breakpoints.down('sm')]: {
			fontSize: '0.8rem',
			paddingBottom: theme.spacing(0),
		},
	},
	bodyText: {
		[theme.breakpoints.down('sm')]: {
			fontSize: '0.8rem',
		},
	},
	userAddress: {
		color: '#F2A52B',
	},
	icon: {
		height: '20px',
		width: '20px',
		marginLeft: '-80px',
		position: 'absolute',
		[theme.breakpoints.down('sm')]: {
			height: '15px',
			width: '15px',
			marginLeft: '-60px',
		},
	},
	rankContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
}));

const LeaderBoard = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { leaderBoard, user, uiState } = store;
	const { accountDetails } = user;
	const { queueNotification } = uiState;

	const pagination = (): JSX.Element | null => {
		const mobileBreakpoint = window.innerWidth < 960;

		if (!leaderBoard.data) {
			return null;
		}

		if (mobileBreakpoint) {
			return (
				<div className={classes.pageContainer}>
					<Pagination
						count={Math.ceil(leaderBoard.data.count / leaderBoard.data.size)}
						variant="outlined"
						color="primary"
						size="small"
						page={leaderBoard.data.page + 1}
						onChange={(_event: any, page: number) => leaderBoard.setPage(page - 1)}
					/>
				</div>
			);
		} else {
			return (
				<div className={classes.pageContainer}>
					<TablePagination
						rowsPerPageOptions={[20, 50, 100]}
						size="small"
						component="div"
						count={leaderBoard.data.count}
						rowsPerPage={leaderBoard.data.size}
						page={leaderBoard.data.page}
						onChangePage={(_event, page) => leaderBoard.setPage(page)}
						onChangeRowsPerPage={(event) => leaderBoard.setSize(parseInt(event.target.value, 10))}
					/>
				</div>
			);
		}
	};

	const viewRank = (): void => {
		if (!accountDetails || !leaderBoard.data) {
			return;
		}
		if (accountDetails.boostRank > leaderBoard.data.count) {
			queueNotification(`Your address is currently unranked.`, 'info');
			return;
		}
		leaderBoard.setPage(Math.ceil(accountDetails.boostRank / leaderBoard.data.size) - 1);
	};

	return (
		<Paper className={classes.leaderboardPaper}>
			<TableContainer>
				<Link onClick={viewRank} component="button" variant="body2" className={classes.viewButton}>
					Show My Rank
				</Link>
				<Table size="small">
					<TableHead className={classes.headerRow}>
						<TableRow>
							<LeaderBoardCell align="center" className={classes.headerText}>
								Rank
							</LeaderBoardCell>
							<LeaderBoardCell align="center" className={classes.headerText}>
								Address
							</LeaderBoardCell>
							<LeaderBoardCell align="center" className={classes.headerText}>
								Boost
							</LeaderBoardCell>
							<LeaderBoardCell align="center" className={classes.headerText}>
								Stake Ratio
							</LeaderBoardCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{leaderBoard.data &&
							leaderBoard.data.data.map((entry) => {
								const myRank = entry.rank === accountDetails?.boostRank;
								return (
									<TableRow key={entry.rank}>
										<LeaderBoardCell
											align="center"
											className={clsx(classes.bodyText, myRank && classes.userAddress)}
										>
											<div className={classes.rankContainer}>
												{myRank && (
													<img
														src="./assets/icons/badger_saiyan.png"
														className={classes.icon}
													/>
												)}
												{entry.rank}
											</div>
										</LeaderBoardCell>
										<LeaderBoardCell
											align="center"
											className={clsx(classes.bodyText, myRank && classes.userAddress)}
										>
											{entry.address}
										</LeaderBoardCell>
										<LeaderBoardCell
											align="center"
											className={clsx(classes.bodyText, myRank && classes.userAddress)}
										>
											{parseFloat(entry.boost).toFixed(10)}
										</LeaderBoardCell>
										<LeaderBoardCell
											align="center"
											className={clsx(classes.bodyText, myRank && classes.userAddress)}
										>
											{parseFloat(entry.stakeRatio).toFixed(5)}
										</LeaderBoardCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>

			{leaderBoard.data && pagination()}
			{!leaderBoard.data && (
				<div className={classes.pageContainer}>
					<Loader message="Loading LeaderBoard..." />
				</div>
			)}
		</Paper>
	);
});

export default LeaderBoard;
