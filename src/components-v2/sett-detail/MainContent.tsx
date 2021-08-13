import React from 'react';
import { Grid, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { SpecsCard } from './specs/SpecsCard';
import { Description } from './Description';
import { ActionButtons } from './ActionButtons';
import { Breadcrumb } from './Breadcrumb';
import { ChartsCard } from './charts/ChartsCard';

const useStyles = makeStyles((theme) => ({
	content: {
		margin: 'auto',
		[theme.breakpoints.up('md')]: {
			marginTop: theme.spacing(2),
		},
	},
	descriptionSection: {
		justifyContent: 'space-between',
		marginBottom: theme.spacing(5),
	},
	breadcrumbContainer: {
		marginBottom: theme.spacing(1),
	},
}));

export const MainContent = (): JSX.Element => {
	const classes = useStyles();
	const canFitActionButtons = useMediaQuery(useTheme().breakpoints.up(680));

	return (
		<Grid container className={classes.content}>
			<Grid container className={classes.breadcrumbContainer}>
				<Breadcrumb />
			</Grid>
			<Grid container className={classes.descriptionSection}>
				<Description />
				{canFitActionButtons && <ActionButtons />}
			</Grid>
			<Grid container spacing={1}>
				<Grid item xs={12} md={4} lg={3}>
					<SpecsCard />
				</Grid>
				<Grid item xs={12} md={8} lg={9}>
					<ChartsCard />
				</Grid>
			</Grid>
		</Grid>
	);
};
