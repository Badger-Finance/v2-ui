import { Switch } from '@material-ui/core';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

export default {
	title: 'Switch',
	component: Switch,
	argTypes: {
		color: {
			options: ['primary', 'secondary', 'default'],
			control: 'select',
		},
		size: {
			options: ['small', 'medium'],
			control: 'select',
		},
	},
} as ComponentMeta<typeof Switch>;

const Template: ComponentStory<typeof Switch> = (args) => <Switch {...args} />;

export const Primary = Template.bind({});

Primary.args = {
	checked: true,
	color: 'primary',
	size: 'medium',
};

export const Secondary = Template.bind({});

Secondary.args = {
	checked: true,
	color: 'secondary',
};

export const Unchecked = Template.bind({});

Unchecked.args = {
	checked: false,
};

export const Disabled = Template.bind({});

Disabled.args = {
	checked: false,
	disabled: true,
	color: 'default',
};
