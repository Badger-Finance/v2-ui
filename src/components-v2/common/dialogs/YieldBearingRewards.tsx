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
  SvgIcon,
  Theme,
  Typography,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import CloseIcon from '@material-ui/icons/Close';

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

interface YeildBearingRewardsTypes {
  open: boolean;
  onModalClose: () => void;
}

const YeildBearingRewards = observer(({ open, onModalClose }: YeildBearingRewardsTypes) => {
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
          <SvgIcon>
            <svg width="16" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.989 10.149c.137-.536.72-.536.857 0l.807 3.148c.177.692.476 1.32.873 1.836s.88.904 1.413 1.134l2.42 1.048c.412.179.412.936 0 1.115l-2.421 1.048c-.533.23-1.016.62-1.413 1.135a5.083 5.083 0 0 0-.872 1.837l-.807 3.146a.602.602 0 0 1-.164.293.386.386 0 0 1-.264.111.386.386 0 0 1-.265-.111.602.602 0 0 1-.164-.293l-.806-3.147a5.081 5.081 0 0 0-.873-1.836c-.397-.516-.88-.904-1.412-1.135L3.476 18.43a.48.48 0 0 1-.224-.213.712.712 0 0 1-.086-.344c0-.124.03-.244.086-.345a.48.48 0 0 1 .224-.213l2.422-1.048c.532-.23 1.015-.619 1.412-1.134a5.082 5.082 0 0 0 .873-1.836l.806-3.148ZM4.16 1.863a.362.362 0 0 1 .099-.175.232.232 0 0 1 .159-.067c.057 0 .112.024.159.067.046.043.08.105.098.175l.484 1.888c.216.842.724 1.502 1.371 1.783l1.453.629a.289.289 0 0 1 .134.128c.034.06.052.132.052.207a.428.428 0 0 1-.052.206.289.289 0 0 1-.134.128l-1.453.63a2.17 2.17 0 0 0-.847.68c-.238.31-.418.687-.524 1.102l-.484 1.888a.362.362 0 0 1-.098.175.232.232 0 0 1-.16.067.232.232 0 0 1-.158-.067.362.362 0 0 1-.099-.175l-.484-1.888a3.05 3.05 0 0 0-.523-1.102 2.17 2.17 0 0 0-.848-.68l-1.452-.63a.289.289 0 0 1-.135-.128.428.428 0 0 1-.051-.206c0-.075.018-.147.051-.207a.289.289 0 0 1 .135-.128l1.452-.629c.32-.138.61-.371.848-.68a3.05 3.05 0 0 0 .523-1.103l.484-1.888ZM12.996.158a.24.24 0 0 1 .067-.114.154.154 0 0 1 .105-.044c.037 0 .074.015.105.044.03.028.054.068.066.114l.322 1.258c.144.562.483 1.003.915 1.19l.968.419a.194.194 0 0 1 .088.086c.022.04.034.088.034.137a.286.286 0 0 1-.034.136.194.194 0 0 1-.088.086l-.968.42a1.446 1.446 0 0 0-.565.454 2.032 2.032 0 0 0-.35.735l-.322 1.258a.241.241 0 0 1-.066.115.155.155 0 0 1-.105.043.154.154 0 0 1-.105-.043.24.24 0 0 1-.067-.115l-.322-1.258a2.032 2.032 0 0 0-.35-.735 1.446 1.446 0 0 0-.565-.455l-.966-.419a.195.195 0 0 1-.089-.086.287.287 0 0 1-.033-.136c0-.05.012-.097.033-.137a.195.195 0 0 1 .089-.086l.967-.42c.433-.186.771-.627.915-1.189L12.996.16V.158Z"
                fill="#FFB84D"
              />
            </svg>
          </SvgIcon>
          Yield-Bearing Rewards
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

export default YeildBearingRewards;
