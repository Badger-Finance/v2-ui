import { Button, CircularProgress, DialogContent, Grid, withStyles } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';

export const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
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

export const VaultDialogContent = withStyles({
  dividers: {
    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
    borderBottom: 0,
  },
})(DialogContent);

export const LoaderSpinner = styled(CircularProgress)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));
