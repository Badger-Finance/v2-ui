import React from 'react';
import { Link, makeStyles } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { PageHeaderContainer } from '../common/Containers';
import { StoreContext } from '../../mobx/store-context';
import { getRouteBySlug } from 'mobx/utils/helpers';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  widgets: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(3),
      justifyContent: 'center',
    },
  },
  backArrow: {
    marginRight: 12,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export const Header = (): JSX.Element => {
  const { router, setts } = React.useContext(StoreContext);
  const classes = useStyles();
  const settSlug = router.params?.settName?.toString();

  return (
    <PageHeaderContainer container className={classes.root}>
      <Link component="button" className={classes.links} onClick={() => router.goTo(getRouteBySlug(settSlug, setts))}>
        <ArrowBackIcon className={classes.backArrow} />
        Back to All Setts
      </Link>
    </PageHeaderContainer>
  );
};
