import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Button, Card, Grid, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	root: {
		height: 731,
		textAlign: 'center',
		padding: theme.spacing(4),
	},
	filtersButton: {
		width: 180,
	},
	content: {
		marginTop: 126,
		height: 300,
	},
}));

const EmptyVaultSearch = (): JSX.Element => {
	const classes = useStyles();
	const { vaults } = useContext(StoreContext);

	const handleOpenFilter = () => {
		vaults.showVaultFilters = true;
	};

	return (
		<Grid container component={Card} className={classes.root} justifyContent="center">
			<Grid container item xs={10} sm={6} md={3} className={classes.content}>
				<Grid container direction="column" justifyContent="center" spacing={1}>
					<Grid item>
						<img src="/assets/icons/empty-vaults-search.svg" alt="vault search is empty" />
					</Grid>
					<Grid item>
						<Typography variant="h6" color="textSecondary">
							Hmmm...
						</Typography>
					</Grid>
				</Grid>
				<Grid container justifyContent="center">
					<Typography variant="body2">
						{"We couldn't find any matches for your selected filters. Try other filters?"}
					</Typography>
				</Grid>
				<Grid container>
					<Grid item xs={12}>
						<Button
							variant="contained"
							onClick={handleOpenFilter}
							color="primary"
							className={classes.filtersButton}
						>
							Filters
						</Button>
					</Grid>
					<Grid item xs={12}>
						<Button variant="text" color="primary" onClick={() => vaults.clearFilters()}>
							Go Back To All Setts
						</Button>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default observer(EmptyVaultSearch);
