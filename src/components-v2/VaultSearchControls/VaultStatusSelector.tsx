import { VaultState } from '@badger-dao/sdk';
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  makeStyles,
  MenuItem,
  Select,
} from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles({
  formControl: {
    width: '100%',
    textTransform: 'capitalize',
  },
  capitalized: {
    textTransform: 'capitalize',
  },
});

interface Props {
  statuses?: VaultState[];
  onChange: (statuses: VaultState[]) => void;
}

const VaultStatusSelector = ({
  statuses = [],
  onChange,
}: Props): JSX.Element => {
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onChange(event.target.value as VaultState[]);
  };

  return (
    <FormControl
      variant="outlined"
      className={classes.formControl}
      color="primary"
    >
      <InputLabel id="status-selector-id-label">Status</InputLabel>
      <Select
        multiple
        labelId="status-selector-id-label"
        id="status-selector"
        value={statuses}
        onChange={handleChange}
        label="Status"
        inputProps={{ 'data-testid': 'status-selector-input' }}
        renderValue={(selected) => (selected as string[]).join(',  ')}
      >
        <MenuItem disabled value="">
          <em>Status</em>
        </MenuItem>
        {Object.values(VaultState).map((status) => (
          <MenuItem className={classes.capitalized} key={status} value={status}>
            <Checkbox color="primary" checked={statuses.indexOf(status) > -1} />
            <ListItemText primary={status} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default VaultStatusSelector;
