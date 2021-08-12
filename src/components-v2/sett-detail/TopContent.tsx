import React from 'react';
import { Grid, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { Breadcrumb } from './Breadcrumb';
import { Description } from './description/Description';
import { SettActionButtons } from '../common/SettActionButtons';
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
	isWithdrawDisabled?: boolean;
	isDepositDisabled?: boolean;
	onWithdrawClick: () => void;
	onDepositClick: () => void;
}

export const TopContent = ({
	sett,
	onDepositClick,
	onWithdrawClick,
	isWithdrawDisabled = true,
	isDepositDisabled = true,
}: Props): JSX.Element => {
	const classes = useStyles();
	const isMediumSizeScreen = useMediaQuery(useTheme().breakpoints.up('sm'));

	return (
		<Grid container>
			<Grid container className={classes.breadcrumbContainer}>
				<Breadcrumb sett={sett} />
			</Grid>
			<Grid container className={classes.descriptionSection}>
				<Description sett={sett} />
				{isMediumSizeScreen && (
					<SettActionButtons
						isDepositDisabled={isDepositDisabled}
						isWithdrawDisabled={isWithdrawDisabled}
						onDepositClick={onDepositClick}
						onWithdrawClick={onWithdrawClick}
					/>
				)}
			</Grid>
		</Grid>
	);
};
