import { Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { CheckboxControlProps } from './types';

const OnlyDepositsControl = ({
  checked,
  onChange,
  ...muiProps
}: CheckboxControlProps): JSX.Element => {
  const handleDepositChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <FormControlLabel
      {...muiProps}
      control={
        <Checkbox
          checked={checked}
          color="primary"
          onChange={handleDepositChange}
        />
      }
      label={<Typography variant="body2">Only show deposits</Typography>}
    />
  );
};

export default observer(OnlyDepositsControl);
