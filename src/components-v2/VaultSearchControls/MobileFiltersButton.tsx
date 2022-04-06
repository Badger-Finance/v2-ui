import React, { useContext } from 'react';
import { Button, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
	button: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#3B3B3B',
		width: 170,
		padding: '6px 15px',
		[theme.breakpoints.down('xs')]: {
			width: 130,
		},
	},
	buttonLabel: {
		textTransform: 'capitalize',
	},
}));

const MobileFiltersButton = (): JSX.Element => {
	const { vaults } = useContext(StoreContext);
	const classes = useStyles();
	const isSmMobile = useMediaQuery(useTheme().breakpoints.down('xs'));
	const text = isSmMobile ? 'Filters' : 'Filters & Search';

	const openDialog = () => {
		vaults.showVaultFilters = true;
	};

	return (
		<>
			<Button className={classes.button} classes={{ label: classes.buttonLabel }} onClick={openDialog}>
				<Typography variant="body2" display="inline">
					{text}
				</Typography>
				<FilterListIcon />
			</Button>
		</>
	);
};

export default observer(MobileFiltersButton);
