import React from 'react';
import { Grid, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { SpecsCard } from './specs/SpecsCard';
import { Description } from './Description';
import { ActionButtons } from './ActionButtons';
import { Breadcrumb } from './Breadcrumb';
import {LayoutContainer} from "../common/Containers";

const useStyles = makeStyles((theme) => ({
	descriptionSection: {
		justifyContent: 'space-between',
		marginBottom: theme.spacing(5),
	},
	breadcrumbContainer: {
		marginBottom: theme.spacing(1),
	},
}));

export const Content = (): JSX.Element => {
	const classes = useStyles();
	const canFitActionButtons = useMediaQuery(useTheme().breakpoints.up(680));

	return (
		<LayoutContainer>
			<Grid container className={classes.breadcrumbContainer}>
				<Breadcrumb />
			</Grid>
			<Grid container className={classes.descriptionSection}>
				<Description />
				{canFitActionButtons && <ActionButtons />}
			</Grid>
			<Grid item xs={12} lg={4}>
				<SpecsCard />
			</Grid>
		</LayoutContainer>
	);
};
