import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: 'rgba(255,255,255,0.6)',
    paddingTop: 0,
    paddingBottom: 30,
  },
  title: {
    padding: 20,
  },
  titleText: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      marginRight: 10,
    },
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

const rows: { role: string; link: string }[] = [];

interface RoleListTypes {
  open: boolean;
  onModalClose: () => void;
}

const GovernanceRoleList = ({ open, onModalClose }: RoleListTypes) => {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={onModalClose}
      fullWidth
      maxWidth="xl"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" className={classes.title}>
        <Box className={classes.titleText}>
          <Typography variant="h6" color="primary">
            Council Roles
          </Typography>
        </Box>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onModalClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent id="alert-dialog-description" className={classes.root}>
        <TableContainer>
          <Table aria-label="Governance Portal - Council Roles">
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell align="right">Etherscan Link</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.role}>
                  <TableCell component="th" scope="row">
                    {row.role}
                  </TableCell>
                  <TableCell align="right">{row.link}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default GovernanceRoleList;
