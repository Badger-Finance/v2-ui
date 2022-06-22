import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ComponentMeta } from '@storybook/react';
import React, { useState } from 'react';

export default {
  title: 'Filled Select',
  component: Select,
  argTypes: {
    color: {
      options: ['primary', 'secondary', 'default'],
      control: 'select',
    },
  },
} as ComponentMeta<typeof Select>;

interface Props {
  color?: SelectProps['color'];
}

const useStyles = makeStyles({
  formControl: {
    minWidth: 203,
  },
});

export const Normal = ({ color }: Props) => {
  const classes = useStyles();
  const [age, setAge] = useState('');

  const handleChange = (event: any) => {
    setAge(event.target.value);
  };

  return (
    <FormControl variant="filled" className={classes.formControl} color={color}>
      <InputLabel id="demo-simple-select-filled-label">Age</InputLabel>
      <Select
        labelId="demo-simple-select-filled-label"
        id="demo-simple-select-filled"
        value={age}
        onChange={handleChange}
        label="Age"
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={10}>Ten</MenuItem>
        <MenuItem value={20}>Twenty</MenuItem>
        <MenuItem value={30}>Thirty</MenuItem>
      </Select>
    </FormControl>
  );
};

export const Error = ({ color }: Props) => {
  const classes = useStyles();
  const [age, setAge] = useState('');

  const handleChange = (event: any) => {
    setAge(event.target.value);
  };

  return (
    <FormControl
      variant="filled"
      className={classes.formControl}
      error
      color={color}
    >
      <InputLabel id="demo-simple-select-filled-label">Age</InputLabel>
      <Select
        labelId="demo-simple-select-filled-label"
        id="demo-simple-select-filled"
        value={age}
        onChange={handleChange}
        label="Age"
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={10}>Ten</MenuItem>
        <MenuItem value={20}>Twenty</MenuItem>
        <MenuItem value={30}>Thirty</MenuItem>
      </Select>
      <FormHelperText>Error</FormHelperText>
    </FormControl>
  );
};

export const Disabled = ({ color }: Props) => {
  const classes = useStyles();
  return (
    <FormControl
      variant="filled"
      className={classes.formControl}
      color={color}
      disabled
    >
      <InputLabel id="demo-simple-select-filled-disabled-label">Age</InputLabel>
      <Select
        labelId="demo-simple-select-filled-disabled-label"
        id="demo-simple-select-filled"
        value={20}
        label="Age"
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={10}>Ten</MenuItem>
        <MenuItem value={20}>Twenty</MenuItem>
        <MenuItem value={30}>Thirty</MenuItem>
      </Select>
    </FormControl>
  );
};
