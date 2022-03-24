import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Radio } from '@material-ui/core';

export default {
	title: 'Radio Button',
	component: Radio,
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
} as ComponentMeta<typeof Radio>;

const Template: ComponentStory<typeof Radio> = (args) => <Radio {...args} />;

export const Primary = Template.bind({});

Primary.args = {
	checked: true,
	color: 'primary',
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
