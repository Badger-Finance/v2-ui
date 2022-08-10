import { Grid, IconButton, makeStyles, Tooltip } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Skeleton } from '@material-ui/lab';
import { Chain } from 'mobx/model/network/chain';
import { StoreContext } from 'mobx/stores/store-context';
import { numberWithCommas } from 'mobx/utils/helpers';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Typography } from 'ui-library/Typography';

import { getFormattedNetworkName } from '../../utils/componentHelpers';
import CurrencyDisplay from '../common/CurrencyDisplay';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    width: 'calc(100% + 30px)',
    margin: '-30px 0 0 -30px',
    overflowY: 'hidden',
    [theme.breakpoints.down('sm')]: {
      overflowX: 'auto',
      flexWrap: 'nowrap',
    },
    '& > *': {
      display: 'flex',
      margin: '30px 0 0 30px',
      flexWrap: 'none',
      flexShrink: 0,
    },
  },
  loader: {
    display: 'inline-flex',
    marginLeft: 4,
  },
  assets: {
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  historicAPR: {
    padding: '0 2px',
    borderRadius: 0,
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  arrowRightContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    width: 36,
    height: 46,
    zIndex: 1,
    opacity: 0.8,
    cursor: 'pointer',
    background: '#2a2a2a',
  },
}));

export const NavbarStats = observer((): JSX.Element => {
  const {
    prices,
    user: { portfolioValue, getBalance, myAPR },
    chain: { network },
    tree,
    vaults: { protocolSummary },
  } = useContext(StoreContext);

  const barRef = useRef<HTMLDivElement>(null);
  const [hasScrollableContent, setHasScrollableContent] = useState(false);
  const [hasReachedScrollEnd, setHasReachedScrollEnd] = useState(false);
  const classes = useStyles();

  const chain = Chain.getChain(network);
  const badgerToken = chain.deploy.token.length > 0 ? chain.deploy.token : undefined;
  const badgerPrice = badgerToken ? prices.getPrice(badgerToken) : undefined;
  const totalValueLocked = protocolSummary ? protocolSummary.totalValue : undefined;
  const chainName = getFormattedNetworkName(chain);
  const valuePlaceholder = <Skeleton animation="wave" width={32} className={classes.loader} />;

  const handleScrollClick = () => {
    if (barRef.current) {
      barRef.current.scrollTo({
        top: 0,
        left: barRef.current.scrollLeft + 50,
        behavior: 'smooth',
      });
    }
  };

  // track scrolling activity to display right arrow icon on mobile if there is content to be scrolled
  useEffect(() => {
    const ref = barRef.current;

    const sizeObserver = new ResizeObserver((entries) => {
      const target = entries[0].target as HTMLDivElement;
      const hasReachedEnd = target.scrollLeft + target.offsetWidth === target.scrollWidth;
      setHasScrollableContent(target.scrollWidth > target.clientWidth);
      setHasReachedScrollEnd(hasReachedEnd);
    });

    function updateScrollPosition(event: Event) {
      const target = event.target as HTMLDivElement;
      const hasReachedEnd = target.scrollLeft + target.offsetWidth === target.scrollWidth;
      setHasReachedScrollEnd(hasReachedEnd);
    }

    if (ref) {
      setHasScrollableContent(ref.scrollWidth > ref.clientWidth);
      sizeObserver.observe(ref);
      ref.addEventListener('scroll', updateScrollPosition);

      return () => {
        ref.removeEventListener('scroll', updateScrollPosition);
        sizeObserver.unobserve(ref);
      };
    }
  }, []);

  return (
    <>
      {hasScrollableContent && !hasReachedScrollEnd && (
        <div className={classes.arrowRightContainer} onClick={handleScrollClick}>
          <ChevronRightIcon />
        </div>
      )}
      <Grid container className={classes.root} ref={barRef} id="here-ref">
        <Grid item>
          <Typography variant="helperText" display="inline">
            BADGER Price: &nbsp;
          </Typography>
          {badgerPrice ? (
            <CurrencyDisplay
              displayValue={`$${numberWithCommas(badgerPrice.toFixed(2))}`}
              variant="helperText"
              justifyContent="flex-start"
            />
          ) : (
            valuePlaceholder
          )}
        </Grid>
        <Grid item>
          <Typography variant="helperText" display="inline">
            Cycle: {tree.cycle} &nbsp;
            {tree.lastUpdate && `(last: ${tree.lastUpdate})`}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="helperText" display="inline">
            {chainName} TVL: &nbsp;
          </Typography>
          {totalValueLocked ? (
            <CurrencyDisplay
              displayValue={`$${numberWithCommas(totalValueLocked.toFixed())}`}
              variant="helperText"
              justifyContent="flex-start"
            />
          ) : (
            valuePlaceholder
          )}
        </Grid>
        <Grid item className={classes.assets}>
          <Typography variant="helperText" display="inline">
            My Assets: &nbsp;
          </Typography>
          <CurrencyDisplay
            displayValue={`$${numberWithCommas(portfolioValue.toFixed())}`}
            variant="helperText"
            justifyContent="flex-start"
          />
        </Grid>
        <Grid item className={classes.assets}>
          <Tooltip title="Historic APR" arrow>
            <IconButton className={classes.historicAPR}>
              <Typography variant="helperText" display="inline">
                My APR: &nbsp;
              </Typography>
              <CurrencyDisplay
                displayValue={`$${numberWithCommas(myAPR.toFixed())}`}
                variant="helperText"
                justifyContent="flex-start"
              />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </>
  );
});
