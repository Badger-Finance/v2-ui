import React from 'react';
import { Grid, GridProps, makeStyles, Typography } from '@material-ui/core';

interface Props extends Omit<GridProps, 'name'> {
	name: React.ReactNode;
	value: React.ReactNode;
}

const useStyles = makeStyles(() => ({
	spec: {
		fontSize: 12,
		fontWeight: 400,
	},
}));

const SpecItem = ({ name, value, ...griProps }: Props) => {
	const classes = useStyles();
	return (
		<Grid item container justifyContent="space-between" {...griProps}>
			<Typography display="inline" color="textSecondary" className={classes.spec}>
				{name}
			</Typography>
			<Typography variant="subtitle2" display="inline" className={classes.spec}>
				{value}
			</Typography>
		</Grid>
	);
};

export default SpecItem;
