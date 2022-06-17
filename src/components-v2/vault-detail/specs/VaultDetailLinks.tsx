import { VaultDTO } from '@badger-dao/sdk';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { ethers } from 'ethers';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { StyledDivider } from '../styled';
import VaultDetailLink from './VaultDetailLink';

const useStyles = makeStyles((theme) => ({
	showMoreContainer: {
		display: 'flex',
		alignItems: 'flex-end',
		justifyContent: 'flex-start',
		cursor: 'pointer',
	},
	showMore: {
		color: theme.palette.primary.main,
		fontSize: 12,
		padding: theme.spacing(0.2),
	},
	linksContainer: {
		display: 'flex',
		flexDirection: 'column',
	},
}));

interface Props {
	vault: VaultDTO;
}

const VaultDetailLinks = observer(({ vault }: Props): JSX.Element => {
	const { network: networkStore } = React.useContext(StoreContext);
	const { network } = networkStore;
	const classes = useStyles();

	const { vaultToken } = vault;
	const strategy = network.strategies[vaultToken];
	const underlyingToken = vault.underlyingToken;
	const strategyAddress = vault.strategy.address;

	return (
		<Grid container className={classes.linksContainer}>
			<Typography>Links</Typography>
			<StyledDivider />
			{strategy.userGuide && <VaultDetailLink title="User Guide" href={strategy.userGuide} />}
			{strategy.strategyLink && <VaultDetailLink title="Strategy Diagram" href={strategy.strategyLink} />}
			{strategy.depositLink && <VaultDetailLink title="Get Deposit Token" href={strategy.depositLink} />}
			<VaultDetailLink title="Vault Address" href={`${network.explorer}/address/${vaultToken}`} />
			<VaultDetailLink title="Strategy Address" href={`${network.explorer}/address/${strategyAddress}`} />
			<VaultDetailLink title="Underlying Token Address" href={`${network.explorer}/address/${underlyingToken}`} />
		</Grid>
	);
});

export default VaultDetailLinks;
