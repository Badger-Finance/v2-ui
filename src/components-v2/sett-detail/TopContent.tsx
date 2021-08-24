import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { Breadcrumb } from './Breadcrumb';
import { Description } from './description/Description';
import { Sett } from '../../mobx/model/setts/sett';

const useStyles = makeStyles((theme) => ({
	content: {
		margin: 'auto',
		[theme.breakpoints.up('md')]: {
			marginTop: theme.spacing(2),
		},
	},
	descriptionSection: {
		justifyContent: 'space-between',
		marginBottom: theme.spacing(4),
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(2),
		},
	},
	breadcrumbContainer: {
		marginBottom: theme.spacing(1),
	},
	holdingsContainer: {
		marginBottom: theme.spacing(2),
	},
}));

interface Props {
	sett: Sett;
}

export const TopContent = ({ sett }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container>
			<Grid container className={classes.breadcrumbContainer}>
				<Breadcrumb sett={sett} />
			</Grid>
			<Grid container className={classes.descriptionSection}>
				<Description sett={sett} />
			</Grid>
		</Grid>
	);
};
