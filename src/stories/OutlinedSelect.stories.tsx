import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from '@material-ui/core';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';
import { makeStyles } from '@material-ui/core/styles';
import { ComponentMeta } from '@storybook/react';
import React, { useState } from 'react';

export default {
  title: 'Outlined Select',
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

  const handleChange: SelectInputProps['onChange'] = (event) => {
    // https://stackoverflow.com/questions/58675993/typescript-react-select-onchange-handler-type-error
    setAge(event.target.value as string);
  };

  return (
    <FormControl
      variant="outlined"
      className={classes.formControl}
      color={color}
    >
      <InputLabel id="demo-simple-select-outlined-label">Age</InputLabel>
      <Select
        labelId="demo-simple-select-outlined-label"
        id="demo-simple-select-outlined"
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

  const handleChange: SelectInputProps['onChange'] = (event) => {
    // https://stackoverflow.com/questions/58675993/typescript-react-select-onchange-handler-type-error
    setAge(event.target.value as string);
  };

  return (
    <FormControl
      variant="outlined"
      className={classes.formControl}
      error
      color={color}
    >
      <InputLabel id="demo-simple-select-outlined-label">Age</InputLabel>
      <Select
        labelId="demo-simple-select-outlined-label"
        id="demo-simple-select-outlined"
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
      variant="outlined"
      className={classes.formControl}
      color={color}
      disabled
    >
      <InputLabel id="demo-simple-select-outlined-disabled-label">
        Age
      </InputLabel>
      <Select
        labelId="demo-simple-select-outlined-disabled-label"
        id="demo-simple-select-outlined"
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
