import { Box, Dialog, DialogContent, DialogTitle, IconButton, makeStyles, Theme, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { observer } from 'mobx-react-lite';

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
  video: {
    display: 'flex',
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
  youtube: {
    flexGrow: 1,
    border: 'none',
    margin: 0,
    padding: 0,
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
        <Box className={classes.titleText}>
          <img src="assets/icons/yield-bearing-rewards.svg" alt="Yield-Bearing Rewards" />
          <Typography variant="h6" color="primary">
            Yield-Bearing Rewards
          </Typography>
        </Box>
        <IconButton aria-label="close" className={classes.closeButton} onClick={onModalClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent id="alert-dialog-description" className={classes.root}>
        {/* <Box className={classes.video}>
          <iframe
            id="ytplayer"
            className={classes.youtube}
            src="https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1&origin=http://example.com"
          ></iframe>
        </Box> */}
        <Typography gutterBottom className={classes.contentText}>
          Yield-Bearing Rewards automate and optimize the complex series of ongoing transactions required to make the
          most of DeFi ecosystems like Aura and Convex.
        </Typography>
        <Typography gutterBottom className={classes.contentText}>
          From the moment you earn them, Yield-Bearing Rewards are put to work earning rewards of their own, maximizing
          the overall return on your deposits. No staking, locking, delegating, voting, bribing or claiming. Just
          earning.
        </Typography>
        <Typography gutterBottom className={classes.contentText}>
          Do Less, Earn More.
        </Typography>
      </DialogContent>
    </Dialog>
  );
});

export default YieldBearingRewards;
