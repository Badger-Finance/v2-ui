import { styled } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import { NumericInput } from '../../components-v2/common/NumericInput';
import red from '@material-ui/core/colors/red';

export const SummaryGrid = styled(Grid)({
	background: 'rgba(20, 20, 20, 0.5)',
	boxShadow: '0px 0.913793px 3.65517px rgba(0, 0, 0, 0.08)',
	margin: '32px -24px',
	padding: '1.7rem',
});

export const BalanceGrid = styled(Grid)(({ theme }) => ({
	padding: theme.spacing(1, 0),
}));

export const BorderedFocusableContainerGrid = styled(Grid)(({ theme }) => ({
	border: '1px solid #5C5C5C',
	borderRadius: 8,
	padding: '18.5px 14px',
	'&:focus-within': {
		borderColor: theme.palette.primary.main,
	},
}));

export const InputTokenActionButtonsGrid = styled(Grid)(({ theme }) => ({
	alignItems: 'center',
	justifyContent: 'flex-end',
	[theme.breakpoints.only('xs')]: {
		justifyContent: 'space-evenly',
	},
}));

export const OutputTokenGrid = styled(Grid)(({ theme }) => ({
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'flex-end',
	[theme.breakpoints.only('xs')]: {
		justifyContent: 'center',
		marginTop: theme.spacing(1),
	},
	[theme.breakpoints.only('md')]: {
		justifyContent: 'center',
		marginTop: theme.spacing(1),
	},
}));

export const OutputContentGrid = styled(Grid)(({ theme }) => ({
	alignItems: 'center',
	padding: theme.spacing(0, 2),
	paddingBottom: theme.spacing(3),
}));

export const OutputBalanceText = styled(Typography)(({ theme }) => ({
	margin: theme.spacing(1, 0),
	wordBreak: 'break-all',
	textAlign: 'end',
	[theme.breakpoints.only('xs')]: {
		margin: theme.spacing(2, 0),
		textAlign: 'center',
	},
	[theme.breakpoints.only('md')]: {
		margin: theme.spacing(2, 0),
		textAlign: 'center',
	},
}));

export const OutputAmountText = styled(Typography)(({ theme }) => ({
	wordBreak: 'break-all',
	[theme.breakpoints.only('xs')]: {
		margin: theme.spacing(1, 0),
		textAlign: 'center',
	},
	[theme.breakpoints.only('md')]: {
		margin: theme.spacing(1, 0),
		textAlign: 'center',
	},
}));

export const EndAlignText = styled(Typography)({
	textAlign: 'end',
});

export const ErrorText = styled(Typography)({
	color: red[400],
	whiteSpace: 'pre-wrap',
	wordBreak: 'break-all',
	'-moz-white-space': 'pre-wrap',
});

export const InputTokenAmount = styled(NumericInput)({
	fontSize: '3rem',
	fontWeight: 500,
	'&::-webkit-input-placeholder, &::-moz-placeholder, &:-ms-input-placeholder, &:-moz-placeholder': {
		color: '#afafaf',
	},
});
