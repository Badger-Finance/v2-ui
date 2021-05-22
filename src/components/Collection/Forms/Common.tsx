import { styled } from '@material-ui/core/styles';
import { Button, Grid, TextField } from '@material-ui/core';

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
