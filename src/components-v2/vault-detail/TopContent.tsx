import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { Breadcrumb } from './Breadcrumb';
import { Description } from './description/Description';
import { VaultDTO } from '@badger-dao/sdk';

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
	vault: VaultDTO;
}

export const TopContent = ({ vault }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container>
			<Grid container className={classes.breadcrumbContainer}>
				<Breadcrumb vault={vault} />
			</Grid>
			<Grid container className={classes.descriptionSection}>
				<Description vault={vault} />
			</Grid>
		</Grid>
	);
};
