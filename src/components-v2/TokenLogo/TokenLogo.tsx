import { Token } from '@badger-dao/sdk';
import React, { SyntheticEvent } from 'react';

import { getTokenIconPath } from '../../utils/componentHelpers';

interface Props extends React.HTMLAttributes<HTMLImageElement> {
  token: Token | { symbol: string };
  width?: string;
  height?: string;
}

const TokenLogo = ({ token, ...imageProps }: Props): JSX.Element => {
  const handleError = ({ currentTarget }: SyntheticEvent<HTMLImageElement>) => {
    currentTarget.src = '/assets/icons/token-logo-fallback.svg';
    currentTarget.onerror = null;
  };
  return (
    <img
      width="32"
      height="32"
      {...imageProps}
      src={getTokenIconPath(token)}
      onError={handleError}
      alt={`${token.symbol} logo`}
    />
  );
};

export default TokenLogo;
