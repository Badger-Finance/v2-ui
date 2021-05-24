import { styled, TableCell } from '@material-ui/core';

export const LeaderBoardCell = styled(TableCell)(({ theme }) => ({
	borderBottom: 'none',
	[theme.breakpoints.down('sm')]: {
		paddingBottom: 0,
	},
}));
