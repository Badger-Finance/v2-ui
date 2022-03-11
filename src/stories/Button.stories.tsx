import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Button } from '@material-ui/core';

export default {
	title: 'Buttons',
	component: Button,
	args: {
		children: 'Button',
		disabled: false,
		fullWidth: false,
	},
	argTypes: {
		variant: {
			options: ['contained', 'outlined', 'text'],
			control: 'select',
		},
		color: {
			options: ['primary', 'secondary', 'default'],
			control: 'select',
		},
		size: {
			options: ['small', 'medium', 'large'],
			control: 'select',
		},
	},
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Contained = Template.bind({});

Contained.args = {
	variant: 'contained',
	color: 'primary',
	size: 'medium',
};

export const Outlined = Template.bind({});

Outlined.args = {
	variant: 'outlined',
	color: 'primary',
	size: 'medium',
};
