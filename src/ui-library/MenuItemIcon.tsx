import { ListItemIcon, ListItemIconProps, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles({
  root: {
    minWidth: 0,
  },
});

const MenuItemIcon = (props: ListItemIconProps): JSX.Element => {
  const classes = useStyles();
  return (
    <ListItemIcon
      {...props}
      classes={{
        ...(props.classes ?? {}),
        root: clsx(classes.root, props.classes?.root),
      }}
    >
      {props.children}
    </ListItemIcon>
  );
};

export default MenuItemIcon;
