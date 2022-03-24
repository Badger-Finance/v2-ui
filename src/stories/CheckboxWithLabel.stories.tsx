import React, { useState } from 'react';
import { ComponentMeta } from '@storybook/react';
import { Checkbox, FormControlLabel } from '@material-ui/core';

export default {
	title: 'Checkbox With Label',
	component: FormControlLabel,
	args: {
		label: 'Label',
	},
} as ComponentMeta<typeof Checkbox>;

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
			control={<Checkbox color="primary" checked={checked} onChange={handleChange} />}
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
			control={<Checkbox color="secondary" checked={checked} onChange={handleChange} />}
			label={label}
		/>
	);
};

export const Indeterminate = ({ label }: StoryProps) => {
	const [checked, setChecked] = useState(true);
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked);
	};
	return (
		<FormControlLabel
			control={<Checkbox color="primary" indeterminate checked={checked} onChange={handleChange} />}
			label={label}
		/>
	);
};

export const Disabled = ({ label }: StoryProps) => {
	const [checked, setChecked] = useState(true);
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked);
	};
	return <FormControlLabel control={<Checkbox checked={checked} onChange={handleChange} />} label={label} disabled />;
};
