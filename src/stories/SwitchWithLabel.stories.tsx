import { FormControlLabel, Switch } from '@material-ui/core';
import { ComponentMeta } from '@storybook/react';
import React, { useState } from 'react';

export default {
  title: 'Switch Button With Label',
  component: FormControlLabel,
  args: {
    label: 'Label',
  },
} as ComponentMeta<typeof FormControlLabel>;

interface StoryProps {
  label: string;
}

export const Primary = ({ label }: StoryProps) => {
  const [checked, setChecked] = useState(true);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  return (
    <FormControlLabel
      control={
        <Switch color="primary" checked={checked} onChange={handleChange} />
      }
      label={label}
    />
  );
};

export const Secondary = ({ label }: StoryProps) => {
  const [checked, setChecked] = useState(true);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  return (
    <FormControlLabel
      control={
        <Switch color="secondary" checked={checked} onChange={handleChange} />
      }
      label={label}
    />
  );
};

export const Disabled = ({ label }: StoryProps) => {
  const [checked, setChecked] = useState(true);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  return (
    <FormControlLabel
      control={<Switch checked={checked} onChange={handleChange} />}
      label={label}
      disabled
    />
  );
};
