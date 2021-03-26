import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { StoreContext } from 'mobx/store-context';

export const NoWalletPlaceHolder: React.FC = ({ children }) => {
	const store = React.useContext(StoreContext);

	if (!store.wallet.connectedAddress) {
		return (
			<Grid item xs={12} style={{ textAlign: 'center' }}>
				<Typography variant="h5" color="textPrimary">
					-
				</Typography>
			</Grid>
		);
	}

	return <>{children}</>;
};
