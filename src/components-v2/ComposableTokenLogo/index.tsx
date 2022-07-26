import { TokenValue } from '@badger-dao/sdk';
import { makeStyles } from '@material-ui/core';
import React from 'react';

import TokenLogo from '../TokenLogo';

const logoWidth = 32;
const overlapGapPercentage = 0.3; // we want the tokens to be overlapping by 30% of their width
const spacingGap = logoWidth * overlapGapPercentage;

function useLogoStyles(logoPosition: number) {
  return makeStyles({
    position: {
      // allow each logo file to have the width of up to two times the expected size
      maxWidth: logoWidth * 2,
      zIndex: logoPosition + 1,
      // we move the logos to the left except from the first logo
      marginRight: -spacingGap,
      '&:last-child': {
        marginRight: 0,
      },
    },
  });
}

interface Props {
  token: TokenValue;
  logoPosition: number;
}

const ComposableTokenLogo = ({ token, logoPosition }: Props): JSX.Element => {
  const classes = useLogoStyles(logoPosition)();
  return <TokenLogo token={token} className={classes.position} />;
};

export default ComposableTokenLogo;
