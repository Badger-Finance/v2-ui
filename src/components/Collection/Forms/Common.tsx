import { styled } from '@material-ui/core/styles';
import { Button, Grid, TextField, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

export const ActionButton = styled(Button)(({ theme }) => ({
	marginBottom: theme.spacing(1),
}));

export const AssetInformationContainer = styled(Grid)(({ theme }) => ({
	marginBottom: theme.spacing(1),
	[theme.breakpoints.only('xs')]: {
		textAlign: 'center',
	},
}));

export const PercentagesContainer = styled(Grid)(({ theme }) => ({
	marginBottom: theme.spacing(1),
	textAlign: 'center',
	[theme.breakpoints.up('sm')]: {
		textAlign: 'end',
	},
}));

export const AmountTextField = styled(TextField)(({ theme }) => ({
	margin: theme.spacing(1, 0, 1),
}));

export const TextSkeleton = styled(Skeleton)(({ theme }) => ({
	display: 'inline-flex',
	width: '25%',
	paddingLeft: theme.spacing(1),
}));

export const BalanceInformation = styled(Typography)(({ theme }) => ({
	marginBottom: theme.spacing(1),
}));
