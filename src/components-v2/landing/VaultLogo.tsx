import { VaultDTOV3 } from '@badger-dao/sdk';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { HTMLAttributes } from 'react';

import ComposableTokenLogo from '../ComposableTokenLogo';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
});

interface Props extends HTMLAttributes<HTMLDivElement> {
  tokens: VaultDTOV3['tokens'];
}

const VaultLogo = ({ tokens, className, ...props }: Props): JSX.Element => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, className && className)} {...props}>
      {tokens.map((token, index) => (
        <ComposableTokenLogo token={token} logoPosition={index} key={`${token.symbol}_${index}`} />
      ))}
    </div>
  );
};

export default VaultLogo;
