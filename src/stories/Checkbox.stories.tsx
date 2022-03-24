import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Checkbox } from '@material-ui/core';

export default {
	title: 'Checkbox',
	component: Checkbox,
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
} as ComponentMeta<typeof Checkbox>;

const Template: ComponentStory<typeof Checkbox> = (args) => <Checkbox {...args} />;

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

export const Indeterminate = Template.bind({});

Indeterminate.args = {
	checked: true,
	color: 'primary',
	indeterminate: true,
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
