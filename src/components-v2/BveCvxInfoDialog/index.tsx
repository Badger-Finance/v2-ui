import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider as MuiDivider,
  IconButton,
  makeStyles,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';

const useStyles = makeStyles(() => ({
  root: {
    padding: 20,
  },
  title: {
    padding: 20,
  },
  content: {
    padding: '0px 20px 20px 20px',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
  },
  divider: {
    margin: '20px 0',
  },
}));

interface ChildrenProps {
  children: React.ReactNode;
}

interface Props extends ChildrenProps {
  open: boolean;
  onClose: () => void;
}

interface TitleProps {
  onClose: () => void;
  title: string;
}

const Title = ({ title, onClose }: TitleProps) => {
  const classes = useStyles();
  return (
    <DialogTitle className={classes.title}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {title}
        <IconButton aria-label="close dialog" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>
  );
};

const Divider = () => {
  const classes = useStyles();
  return <MuiDivider className={classes.divider} />;
};

const Content = ({ children }: ChildrenProps) => {
  const classes = useStyles();
  return <DialogContent className={classes.content}>{children}</DialogContent>;
};

const BveCvxInfoDialogRoot = ({ open, onClose, children }: Props): JSX.Element => {
  return (
    <Dialog fullWidth maxWidth="xl" open={open} onClose={onClose}>
      {children}
    </Dialog>
  );
};

export const BveCvxInfoDialog = Object.assign(BveCvxInfoDialogRoot, { Title, Divider, Content });
