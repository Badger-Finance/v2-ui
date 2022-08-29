import { Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import YeildBearingRewards from 'components-v2/common/dialogs/YieldBearingRewards';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

const useStyles = makeStyles({
  title: {
    fontSize: 20,
    fontWeight: 500,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 40,
    paddingTop: 5,
    '& a': {
      paddingLeft: 5,
      textDecoration: 'underline',
    },
  },
});

const VaultListTitle = observer(() => {
  const classes = useStyles();
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <Typography className={classes.title} component="h1">
        Do Less & Earn More with BadgerDAO
      </Typography>
      <Typography className={classes.subtitle}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do{' '}
        <Link href="#" onClick={() => setOpenModal(true)} color="primary">
          Yield-Bearing Rewards.
        </Link>
      </Typography>
      <YeildBearingRewards open={openModal} onModalClose={() => setOpenModal(false)} />
    </>
  );
});

export default VaultListTitle;
