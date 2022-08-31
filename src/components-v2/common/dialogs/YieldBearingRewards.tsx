import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: 'rgba(255,255,255,0.6)',
    paddingTop: 0,
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
  video: {
    background: '#CCCCCC',
    width: '100%',
    height: 320,
  },
  contentText: {
    paddingTop: 15,
  },
  divider: {
    marginTop: 20,
    marginBottom: 10,
  },
  list: {
    '& li': {
      padding: 0,
    },
    '& .MuiListItemText-root': {
      margin: 0,
    },
  },
}));

interface YieldBearingRewardsTypes {
  open: boolean;
  onModalClose: () => void;
}

const YieldBearingRewards = observer(({ open, onModalClose }: YieldBearingRewardsTypes) => {
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
        <Typography variant="h6" color="primary" className={classes.titleText}>
          <img src="assets/icons/yield-bearing-rewards.svg" alt="Yield-Bearing Rewards" /> Yield-Bearing Rewards
        </Typography>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onModalClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent id="alert-dialog-description" className={classes.root}>
        <Box className={classes.video}></Box>
        <Typography gutterBottom className={classes.contentText}>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam.
          Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
        </Typography>
        <Typography gutterBottom className={classes.contentText}>
          Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet
          rutrum faucibus dolor auctor.
        </Typography>
        <Divider className={classes.divider} />

        <List dense={true} className={classes.list}>
          <ListItem>
            <ListItemText primary="- Excepteur sint occaecat " />
          </ListItem>
          <ListItem>
            <ListItemText primary="- Officia deserunt mollit " />
          </ListItem>
          <ListItem>
            <ListItemText primary="- Tempor incididunt" />
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
});

export default YieldBearingRewards;
