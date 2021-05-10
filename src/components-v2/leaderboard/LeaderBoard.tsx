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
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { observer } from 'mobx-react-lite';
import { LeaderBoardCell } from './styles';
import { StoreContext } from 'mobx/store-context';
import { Loader } from 'components/Loader';

const useStyles = makeStyles((theme) => ({
	leaderboardPaper: {
		paddingTop: theme.spacing(3),
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
			overflow: 'auto',
		},
	},
	paginationButton: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
	},
	headerRow: {
		marginBottom: theme.spacing(1),
	},
	headerText: {
		fontSize: '1.3rem',
		paddingBottom: theme.spacing(2),
		[theme.breakpoints.down('sm')]: {
			fontSize: '1rem',
		},
	},
	bodyText: {
		[theme.breakpoints.down('sm')]: {
			fontSize: '0.8rem',
		},
	},
}));

const LeaderBoard = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { leaderBoard } = store;

	const _leaderboard = () => {
		const mobileBreakpoint = window.innerWidth < 960;

		if (!leaderBoard.data) return <></>;

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

	return (
		<Paper className={classes.leaderboardPaper}>
			<TableContainer>
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
						</TableRow>
					</TableHead>
					<TableBody>
						{leaderBoard.data &&
							leaderBoard.data.data.map((entry) => {
								return (
									<TableRow key={entry.rank}>
										<LeaderBoardCell align="center" className={classes.bodyText}>
											{entry.rank}
										</LeaderBoardCell>
										<LeaderBoardCell align="center" className={classes.bodyText}>
											{entry.address}
										</LeaderBoardCell>
										<LeaderBoardCell align="center" className={classes.bodyText}>
											{parseFloat(entry.boost).toFixed(10)}
										</LeaderBoardCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>

			{leaderBoard.data && _leaderboard()}
			{!leaderBoard.data && (
				<div className={classes.pageContainer}>
					<Loader message="Loading LeaderBoard..." />
				</div>
			)}
		</Paper>
	);
});

export default LeaderBoard;
