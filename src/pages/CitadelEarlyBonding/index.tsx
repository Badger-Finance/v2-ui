import { makeStyles } from '@material-ui/core';
import { Store } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { Paper, Card, Typography, Grid, Box, Link } from '@material-ui/core';
import { LayoutContainer, PageHeaderContainer } from 'components-v2/common/Containers';
import PageHeader from 'components-v2/common/PageHeader';
import { allBonds } from './bonds.config';
import BondOffering from './BondOffering';

const useStyles = makeStyles((theme) => ({
	bondContainer: {
		display: 'flex',
		justifyContent: 'center',
		marginTop: theme.spacing(2),
	},
}));

const CitadelEarlyBonding = observer((): JSX.Element => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	return (
		<LayoutContainer>
			<Grid container justifyContent="center">
				<PageHeaderContainer item container xs={12}>
					<Grid item xs={10} md={6}>
						<PageHeader
							title="Citadel Early Bonding"
							subtitle={
								<Box display="flex" alignItems="center">
									<Typography variant="body2" color="textSecondary">
										Update this Citadel Tag Text @william!{' '}
										<Link
											color="primary"
											target="_blank"
											// TODO: Update this link
											href="https://badger.com/new-to-defi"
											rel="noreferrer"
										>
											Learn More
										</Link>
									</Typography>
								</Box>
							}
						/>
					</Grid>
				</PageHeaderContainer>
			</Grid>
			<Grid container spacing={4}>
				{allBonds.map((bond, i) => {
					return (
						<Grid item xs={12} sm={2} md={4}>
							<BondOffering key={bond.address} bond={bond} />
						</Grid>
					);
				})}
			</Grid>
		</LayoutContainer>
	);
});

export default CitadelEarlyBonding;
