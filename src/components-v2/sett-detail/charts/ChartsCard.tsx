import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Tab, Tabs } from '@material-ui/core';
import { ValueTab } from './ValueTab';
import { CardContainer } from '../styled';

type Mode = 'value' | 'ratio';

const useStyles = makeStyles((theme) => ({
	content: {
		padding: theme.spacing(2, 3),
	},
	tabHeader: { background: 'rgba(0,0,0,.2)' },
}));

export const ChartsCard = (): JSX.Element => {
	const classes = useStyles();
	const [mode, setMode] = useState<Mode>('value');

	return (
		<CardContainer>
			<Tabs
				variant="fullWidth"
				className={classes.tabHeader}
				textColor="primary"
				aria-label="IbBTC Tabs"
				indicatorColor="primary"
				value={mode}
			>
				<Tab onClick={() => setMode('value')} value="value" label="Value" />
				<Tab onClick={() => setMode('ratio')} value="ratio" label="Token Ratio" />
			</Tabs>
			<div className={classes.content}>
				<ValueTab />
			</div>
		</CardContainer>
	);
};
