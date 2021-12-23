import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BadgerVault } from '../../../mobx/model/vaults/badger-vault';
import { Tokens } from './Tokens';
import { Claims } from './Claims';
import VaultDetailLinks from './VaultDetailLinks';
import { Fees } from './Fees';
import { CardContainer } from '../styled';
import VaultMetrics from './VaultMetrics';
import { Vault } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
	root: {
		flexDirection: 'column',
		padding: theme.spacing(2),
		display: 'flex',
	},
	specSection: {
		marginBottom: 20,
	},
}));

interface Props {
	vault: Vault;
	badgerVault: BadgerVault;
}

const SpecsCard = ({ vault, badgerVault }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<CardContainer className={classes.root}>
			<Grid item xs className={classes.specSection}>
				<VaultMetrics vault={vault} />
			</Grid>
			<Grid item xs className={classes.specSection}>
				<Tokens vault={vault} />
			</Grid>
			<Grid item xs className={classes.specSection}>
				<Claims />
			</Grid>
			<Grid item xs className={classes.specSection}>
				<Fees vault={vault} />
			</Grid>
			<Grid item xs>
				<VaultDetailLinks vault={vault} badgerVault={badgerVault} />
			</Grid>
		</CardContainer>
	);
};

export default SpecsCard;
