import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ComponentMeta } from '@storybook/react';
import React from 'react';

export default {
  title: 'Dialogs',
  component: Dialog,
} as ComponentMeta<typeof Dialog>;

const useStyles = makeStyles({
  rightButton: {
    marginLeft: 24,
  },
});

export const ExtraSmall = () => {
  const classes = useStyles();
  return (
    <Dialog open={true} maxWidth="xs" fullWidth>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogContent>
        <DialogContentText>Content</DialogContentText>
        <Grid container justifyContent="flex-end">
          <Button color="primary" variant="text">
            Action
          </Button>
          <Button
            color="primary"
            variant="text"
            className={classes.rightButton}
          >
            Action
          </Button>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export const Small = () => {
  const classes = useStyles();
  return (
    <Dialog open={true} maxWidth="sm" fullWidth>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogContent>
        <DialogContentText>Content</DialogContentText>
        <Grid container justifyContent="flex-end">
          <Button color="primary" variant="text">
            Action
          </Button>
          <Button
            color="primary"
            variant="text"
            className={classes.rightButton}
          >
            Action
          </Button>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export const Medium = () => {
  const classes = useStyles();
  return (
    <Dialog open={true} maxWidth="md" fullWidth>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogContent>
        <DialogContentText>Content</DialogContentText>
        <Grid container justifyContent="flex-end">
          <Button color="primary" variant="text">
            Action
          </Button>
          <Button
            color="primary"
            variant="text"
            className={classes.rightButton}
          >
            Action
          </Button>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export const Large = () => {
  const classes = useStyles();
  return (
    <Dialog open={true} maxWidth="lg" fullWidth>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogContent>
        <DialogContentText>Content</DialogContentText>
        <Grid container justifyContent="flex-end">
          <Button color="primary" variant="text">
            Action
          </Button>
          <Button
            color="primary"
            variant="text"
            className={classes.rightButton}
          >
            Action
          </Button>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export const ExtraLarge = () => {
  const classes = useStyles();
  return (
    <Dialog open={true} maxWidth="xl" fullWidth>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogContent>
        <DialogContentText>Content</DialogContentText>
        <Grid container justifyContent="flex-end">
          <Button color="primary" variant="text">
            Action
          </Button>
          <Button
            color="primary"
            variant="text"
            className={classes.rightButton}
          >
            Action
          </Button>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
