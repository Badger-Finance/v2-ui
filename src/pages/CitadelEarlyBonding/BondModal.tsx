import { Modal, Paper, Backdrop, makeStyles, Typography, Button } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import BondInput from './BondInput';
import BondPricing from './BondPricing';
import { IBond } from './bonds.config';

const useStyles = makeStyles((theme) => ({
  modalContainer: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
  },
  bondingPaper: {
    maxWidth: '570px',
    borderRadius: '10px',
    paddingLeft: '51px',
    paddingRight: '51px',
    paddingTop: '33px',
    paddingBottom: '42px',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
      maxWidth: '398px',
    },
  },
	bondIcon: {
		marginRight: theme.spacing(2),
	},
  bondHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(0.5),
  },
  bondButton: {
		width: '100%',
    marginBottom: theme.spacing(1.5),
  },
  pricingContainer: {
    display: 'flex',
    flexGrow: 1,
    alignContent: 'flex-end',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(-2),
  },
}));

interface BondModalProps {
	bond: IBond | null;
  clear: () => void;
}

const BondModal = observer(({ bond, clear }: BondModalProps): JSX.Element | null => {
  const classes = useStyles();
  if (bond === null) {
    return null;
  }
  const { token, address } = bond;
	const tokenName = token.toLowerCase();
  const store = useContext(StoreContext);
  const bondTokenBalance = store.user.getTokenBalance(address);

  return (
    <Modal open={bond !== null} onClose={() => clear()} className={classes.modalContainer}
    BackdropComponent={Backdrop}
    BackdropProps={{
      timeout: 500,
    }}
    aria-labelledby="bond-modal" aria-describedby="Early Bonding Modal">
      <Paper className={classes.bondingPaper}>
        <div className={classes.bondHeader}>
					<img
						src={`/assets/icons/${tokenName}.png`}
						className={classes.bondIcon}
						alt=""
						width={23}
						height={23}
					/>
					<Typography variant="body1" align="left">{token} Bond</Typography>
        </div>
          <div className={classes.pricingContainer}>
            <BondPricing token={token} tokenAddress={address} />
          </div>
        <Typography variant="caption">This bond allows users to buy CTDL from the protocol in exchange for {token}.</Typography>
        <BondInput tokenBalance={bondTokenBalance} onChange={(balance) => {}} />
        <Button variant="contained" color="primary" className={classes.bondButton}>Bond</Button>
        <Typography variant="caption">sCTDL will be available in your wallet upon bonding, however will not be active until Citadel opening at {new Date().toLocaleString()}.</Typography>
      </Paper>
    </Modal>
  );
});

export default BondModal;
