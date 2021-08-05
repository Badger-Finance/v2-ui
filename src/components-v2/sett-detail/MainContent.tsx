import React from 'react';
import { Grid, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { SpecsCard } from './specs/SpecsCard';
import { Description } from './description/Description';
import { ActionButtons } from './ActionButtons';
import { Breadcrumb } from './Breadcrumb';
import { ChartsCard } from './charts/ChartsCard';
import { Holdings } from './Holdings';
import { Sett } from '../../mobx/model/setts/sett';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';

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
	holdingsContainer: {
		marginBottom: theme.spacing(2),
	},
}));

interface Props {
	sett: Sett;
}

export const MainContent = observer(
	({ sett }: Props): JSX.Element => {
		const {
			user: { accountDetails },
			wallet: { connectedAddress },
		} = React.useContext(StoreContext);

		const classes = useStyles();
		const isMediumSizeScreen = useMediaQuery(useTheme().breakpoints.up('sm'));
		const showActionButtons = isMediumSizeScreen && !!connectedAddress;
		const settBalance = accountDetails?.balances.find((settBalance) => settBalance.id === sett.vaultToken);

		return (
			<Grid container className={classes.content}>
				<Grid container className={classes.breadcrumbContainer}>
					<Breadcrumb sett={sett} />
				</Grid>
				<Grid container className={classes.descriptionSection}>
					<Description sett={sett} />
					{showActionButtons && <ActionButtons />}
				</Grid>
				{settBalance && (
					<Grid container className={classes.holdingsContainer}>
						<Holdings settBalance={settBalance} />
					</Grid>
				)}
				<Grid container spacing={1}>
					<Grid item xs={12} md={4} lg={3}>
						<SpecsCard />
					</Grid>
					{isMediumSizeScreen && (
						<Grid item xs={12} md={8} lg={9}>
							<ChartsCard />
						</Grid>
					)}
				</Grid>
			</Grid>
		);
	},
);
