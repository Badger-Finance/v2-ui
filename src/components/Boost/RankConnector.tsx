import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useRankConnectorStyles = (signatureColor: string, isMain: boolean) => {
  return makeStyles(() => ({
    connector: {
      width: isMain ? 8 : 5,
      height: 2,
      marginLeft: 2,
      marginRight: 8,
      background: signatureColor,
      opacity: isMain ? 1 : 0.5,
    },
  }));
};

interface Props {
  signatureColor: string;
  isMain?: boolean;
}

export const RankConnector = ({ signatureColor, isMain = false }: Props): JSX.Element => {
  const classes = useRankConnectorStyles(signatureColor, isMain)();

  return <div className={classes.connector} />;
};
