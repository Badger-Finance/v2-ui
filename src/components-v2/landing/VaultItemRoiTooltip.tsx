import { VaultDTOV3 } from '@badger-dao/sdk';
import { observer } from 'mobx-react-lite';
import React from 'react';

interface Props {
  vault: VaultDTOV3;
  multiplier?: number;
}

const VaultItemRoiTooltip = observer(({ vault, multiplier }: Props): JSX.Element => {
  return (
    <>
      {vault.apy.sources.map((source) => {
        // Should we rename multiplier? this doens't seem right from a verbiage standpoint
        const sourceApr = source.boostable
          ? source.performance.baseYield * (multiplier ?? 1)
          : source.performance.baseYield;
        const apr = `${sourceApr.toFixed(2)}% ${source.name}`;
        return <div key={source.name}>{apr}</div>;
      })}
    </>
  );
});

export default VaultItemRoiTooltip;
