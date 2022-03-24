import React, { useState } from 'react';
import { Collapse, Grid, makeStyles, Typography } from '@material-ui/core';
import { BadgerVault } from '../../../mobx/model/vaults/badger-vault';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { StyledDivider } from '../styled';
import VaultDetailLink from './VaultDetailLink';
import { VaultDTO } from '@badger-dao/sdk';
import { ethers } from 'ethers';

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
	badgerVault: BadgerVault;
}

const VaultDetailLinks = observer(({ vault, badgerVault }: Props): JSX.Element => {
	const { network: networkStore } = React.useContext(StoreContext);
	const { network } = networkStore;
	const classes = useStyles();

	const vaultAddress = badgerVault.vaultToken.address;
	const strategy = network.strategies[vaultAddress];
	const underlyingToken = vault.underlyingToken;
	const strategyAddress =
		vault.strategy?.address && vault.strategy.address !== ethers.constants.AddressZero
			? vault.strategy.address
			: network.strategies[vault.vaultToken].address;

	return (
		<Grid container className={classes.linksContainer}>
			<Typography>Links</Typography>
			<StyledDivider />
			{strategy.userGuide && <VaultDetailLink title="User Guide" href={strategy.userGuide} />}
			{strategy.strategyLink && <VaultDetailLink title="Strategy Diagram" href={strategy.strategyLink} />}
			{strategy.depositLink && <VaultDetailLink title="Get Deposit Token" href={strategy.depositLink} />}
			<VaultDetailLink title="Vault Address" href={`${network.explorer}/address/${vaultAddress}`} />
			<VaultDetailLink title="Strategy Address" href={`${network.explorer}/address/${strategyAddress}`} />
			<VaultDetailLink title="Underlying Token Address" href={`${network.explorer}/address/${underlyingToken}`} />
		</Grid>
	);
});

export default VaultDetailLinks;
