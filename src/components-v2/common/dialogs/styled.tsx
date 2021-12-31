import { Button, CircularProgress, DialogContent, Grid, TextField, Typography, withStyles } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';

export const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export const AssetInformationContainer = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  [theme.breakpoints.only('xs')]: {
    textAlign: 'center',
  },
}));

export const PercentagesContainer = styled(Grid)(({ theme }) => ({
  textAlign: 'center',
  [theme.breakpoints.up('sm')]: {
    textAlign: 'end',
  },
  [theme.breakpoints.down('xs')]: {
    marginTop: theme.spacing(1),
  },
}));

export const AmountTextField = styled(TextField)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export const BalanceInformation = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

export const SettDialogContent = withStyles({
  dividers: {
    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
    borderBottom: 0,
  },
})(DialogContent);

export const LoaderSpinner = styled(CircularProgress)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));
