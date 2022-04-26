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

export const ContainedSmall = Template.bind({});

ContainedSmall.args = {
	variant: 'contained',
	color: 'primary',
	size: 'small',
	children: 'small',
};

export const ContainedMedium = Template.bind({});

ContainedMedium.args = {
	variant: 'contained',
	color: 'primary',
	size: 'medium',
	children: 'medium',
};

export const ContainedLarge = Template.bind({});

ContainedLarge.args = {
	variant: 'contained',
	color: 'primary',
	size: 'large',
	children: 'large',
};

export const OutlinedSmall = Template.bind({});

OutlinedSmall.args = {
	variant: 'outlined',
	color: 'primary',
	size: 'small',
	children: 'small',
};

export const OutlinedMedium = Template.bind({});

OutlinedMedium.args = {
	variant: 'outlined',
	color: 'primary',
	size: 'medium',
	children: 'medium',
};

export const OutlinedLarge = Template.bind({});

OutlinedLarge.args = {
	variant: 'outlined',
	color: 'primary',
	size: 'large',
	children: 'large',
};

export const TextSmall = Template.bind({});

TextSmall.args = {
	variant: 'text',
	color: 'primary',
	size: 'small',
	children: 'small',
};

export const TextMedium = Template.bind({});

TextMedium.args = {
	variant: 'text',
	color: 'primary',
	size: 'medium',
	children: 'medium',
};

export const TextLarge = Template.bind({});

TextLarge.args = {
	variant: 'text',
	color: 'primary',
	size: 'large',
	children: 'large',
};
