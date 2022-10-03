import { Network } from '@badger-dao/sdk';
import { Card, Container, Grid, Link, Paper, Tab, Tabs } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import WrapTextIcon from '@material-ui/icons/WrapText';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';

import { LayoutContainer } from '../../components-v2/common/Containers';
import { Mint } from './Mint';
import { Redeem } from './Redeem';

type TABS = 'Mint' | 'Redeem';

const useStyles = makeStyles((theme) => ({
  cardContainer: { justifyContent: 'center', display: 'flex' },
  tabHeader: { background: 'rgba(0,0,0,.2)' },
  content: {
    padding: theme.spacing(2),
  },
  apyInformation: {
    marginBottom: theme.spacing(4),
  },
  mintContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexGrow: 1,
    marginBottom: theme.spacing(6),
  },
  wrapGuide: {
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    alignItems: 'center',
  },
  wrapGuideIcon: {
    color: theme.palette.primary.main,
    height: '22px',
    width: '22px',
    marginRight: theme.spacing(1),
  },
  wrapGuideLink: {
    marginLeft: 3,
  },
  guideContainer: {
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
  },
  pageContainer: {
    marginTop: 42,
  },
}));

const IbBTC = observer(() => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState<TABS>('Mint');

  const store = useContext(StoreContext);
  const { network } = store.chain;

  const content = (
    <Container className={classes.content} maxWidth="lg">
      {activeTab === 'Mint' && <Mint />}
      {activeTab === 'Redeem' && <Redeem />}
    </Container>
  );

  return (
    <LayoutContainer>
      <Grid container spacing={1} justifyContent="center" className={classes.pageContainer}>
        {network === Network.Ethereum ? (
          <div className={classes.mintContainer}>
            <Grid item xs={12} md={9} lg={7}>
              <Paper className={classes.wrapGuide}>
                <div className={classes.guideContainer}>
                  <WrapTextIcon fontSize="inherit" className={classes.wrapGuideIcon} />
                  <span>
                    Wrap your ibBTC to deposit into Curve. Read our{' '}
                    <Link
                      href="https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/ibbtc-sbtc-curve-lp"
                      className={classes.wrapGuideLink}
                    >
                      ibBTC User Guide
                    </Link>
                  </span>
                </div>
                <span>
                  View the{' '}
                  <Link href="https://wrap.badger.com" className={classes.wrapGuideLink}>
                    Badger ibBTC Wrapper
                  </Link>
                </span>
              </Paper>
            </Grid>
            <Grid item xs={12} md={9} lg={7}>
              <Card>
                <Tabs
                  variant="fullWidth"
                  className={classes.tabHeader}
                  textColor="primary"
                  aria-label="IbBTC Tabs"
                  indicatorColor="primary"
                  value={activeTab}
                >
                  <Tab onClick={() => setActiveTab('Mint')} value={'Mint'} label={'Mint'} />
                  <Tab onClick={() => setActiveTab('Redeem')} value={'Redeem'} label={'Redeem'} />
                </Tabs>
                {content}
              </Card>
            </Grid>
          </div>
        ) : (
          <>
            <Grid item xs={12}>
              ibBTC minting and redeeming is available on ETH Mainnet only.
            </Grid>
          </>
        )}
      </Grid>
    </LayoutContainer>
  );
});
export default IbBTC;
