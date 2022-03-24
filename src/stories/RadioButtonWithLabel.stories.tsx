import React, { useState } from 'react';
import { ComponentMeta } from '@storybook/react';
import { Radio, FormControlLabel } from '@material-ui/core';

export default {
	title: 'Radio Button With Label',
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
		<FormControlLabel control={<Radio color="primary" checked={checked} onChange={handleChange} />} label={label} />
	);
};

export const Secondary = ({ label }: StoryProps) => {
	const [checked, setChecked] = useState(true);
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked);
	};
	return (
		<FormControlLabel
			control={<Radio color="secondary" checked={checked} onChange={handleChange} />}
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
		<FormControlLabel control={<Radio color="primary" checked={checked} onChange={handleChange} />} label={label} />
	);
};

export const Disabled = ({ label }: StoryProps) => {
	const [checked, setChecked] = useState(true);
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked);
	};
	return <FormControlLabel control={<Radio checked={checked} onChange={handleChange} />} label={label} disabled />;
};
