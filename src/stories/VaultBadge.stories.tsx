import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import VaultBadge from '../components-v2/landing/VaultBadge';
import { VaultState } from '@badger-dao/sdk';

export default {
	title: 'Badges',
	component: VaultBadge,
	argTypes: {
		state: {
			options: Object.values(VaultState),
			control: 'select',
		},
	},
} as ComponentMeta<typeof VaultBadge>;

const Template: ComponentStory<typeof VaultBadge> = (args) => <VaultBadge {...args} />;

export const New = Template.bind({});

New.args = {
	state: VaultState.New,
};

export const Guarded = Template.bind({});

Guarded.args = {
	state: VaultState.Guarded,
};

export const Experimental = Template.bind({});

Experimental.args = {
	state: VaultState.Experimental,
};

export const Deprecated = Template.bind({});

Deprecated.args = {
	state: VaultState.Deprecated,
};
