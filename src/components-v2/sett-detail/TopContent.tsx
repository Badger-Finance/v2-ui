import React from 'react';
import { Grid, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { Breadcrumb } from './Breadcrumb';
import { Description } from './description/Description';
import { ActionButtons } from '../common/ActionButtons';
import { Sett } from '../../mobx/model/setts/sett';
import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';

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
	onWithdrawClick: () => void;
	onDepositClick: () => void;
}

export const TopContent = observer(
	({ sett, onDepositClick, onWithdrawClick }: Props): JSX.Element => {
		const store = React.useContext(StoreContext);
		const { connectedAddress } = store.wallet;

		const classes = useStyles();
		const isMediumSizeScreen = useMediaQuery(useTheme().breakpoints.up('sm'));
		const showActionButtons = isMediumSizeScreen && !!connectedAddress;

		return (
			<Grid container>
				<Grid container className={classes.breadcrumbContainer}>
					<Breadcrumb sett={sett} />
				</Grid>
				<Grid container className={classes.descriptionSection}>
					<Description sett={sett} />
					{showActionButtons && (
						<ActionButtons onDepositClick={onDepositClick} onWithdrawClick={onWithdrawClick} />
					)}
				</Grid>
			</Grid>
		);
	},
);
