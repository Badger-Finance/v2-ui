import React, { useState } from 'react';
import { Grid, Button, Checkbox, Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';

export const ResumeForm = (props: any) => {
	const { classes, values, itemContainer } = props;

	return (
		<Grid container alignItems={'center'}>
			To resume your incomplete Transfer, please click on the button on top right corner
		</Grid>
	);
};
