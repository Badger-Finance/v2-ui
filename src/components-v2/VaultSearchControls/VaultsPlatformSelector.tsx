import { Protocol } from '@badger-dao/sdk';
import { Checkbox, FormControl, InputLabel, ListItemText, makeStyles, MenuItem, Select } from '@material-ui/core';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

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
  platforms?: Protocol[];
  onChange: (platforms: Protocol[]) => void;
}

const VaultsPlatformSelector = ({ platforms = [], onChange }: Props): JSX.Element => {
  const {
    vaults: { vaultsProtocols },
  } = useContext(StoreContext);
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onChange(event.target.value as Protocol[]);
  };

  return (
    <FormControl variant="outlined" className={classes.formControl} color="primary">
      <InputLabel id="platform-selector-id-label">Platform</InputLabel>
      <Select
        multiple
        labelId="platform-selector-id-label"
        id="platform-selector"
        value={platforms}
        onChange={handleChange}
        label="Platform"
        inputProps={{ 'data-testid': 'platform-selector-input' }}
        renderValue={(selected) => (selected as string[]).join(',  ')}
      >
        <MenuItem disabled value="">
          <em>Platform</em>
        </MenuItem>
        {vaultsProtocols.map((protocol: Protocol) => (
          <MenuItem className={classes.capitalized} key={protocol} value={protocol}>
            <Checkbox color="primary" checked={platforms.indexOf(protocol) > -1} />
            <ListItemText primary={protocol} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default observer(VaultsPlatformSelector);
