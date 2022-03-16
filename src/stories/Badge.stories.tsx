import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Badge, BadgeType } from 'ui-library/Badge';

export default {
	title: 'Badge',
	component: Badge,
} as ComponentMeta<typeof Badge>;

const Template: ComponentStory<typeof Badge> = (args) => <Badge {...args} />;

export const New = Template.bind({});

New.args = {
	type: BadgeType.NEW,
};

export const Guarded = Template.bind({});

Guarded.args = {
	type: BadgeType.GUARDED,
};

export const Obsolete = Template.bind({});

Obsolete.args = {
	type: BadgeType.OBSOLETE,
};

export const Executed = Template.bind({});

Executed.args = {
	type: BadgeType.EXECUTED,
};

export const Experimental = Template.bind({});

Experimental.args = {
	type: BadgeType.EXPERIMENTAL,
};
