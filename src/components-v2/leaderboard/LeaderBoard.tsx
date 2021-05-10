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
}));

const LeaderBoard = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { leaderBoard } = store;

	return (
		<Paper className={classes.leaderboardPaper}>
			<TableContainer>
				<Table size="small">
					<TableHead>
						<TableRow>
							<LeaderBoardCell align="center">Rank</LeaderBoardCell>
							<LeaderBoardCell align="center">Address</LeaderBoardCell>
							<LeaderBoardCell align="center">Boost</LeaderBoardCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{leaderBoard.data &&
							leaderBoard.data.data.map((entry) => {
								return (
									<TableRow key={entry.rank}>
										<LeaderBoardCell align="center">{entry.rank}</LeaderBoardCell>
										<LeaderBoardCell align="center">{entry.address}</LeaderBoardCell>
										<LeaderBoardCell align="center">
											{parseFloat(entry.boost).toFixed(10)}
										</LeaderBoardCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
			{leaderBoard.data && (
				<div className={classes.pageContainer}>
					<TablePagination
						rowsPerPageOptions={[20, 50, 100]}
						component="div"
						count={leaderBoard.data.count}
						rowsPerPage={leaderBoard.data.size}
						page={leaderBoard.data.page}
						onChangePage={(_event, page) => leaderBoard.setPage(page)}
						onChangeRowsPerPage={(event) => leaderBoard.setSize(parseInt(event.target.value, 10))}
					/>
				</div>
			)}
			{!leaderBoard.data && (
				<div className={classes.pageContainer}>
					<Loader message="Loading LeaderBoard..." />
				</div>
			)}
		</Paper>
	);
});

export default LeaderBoard;
