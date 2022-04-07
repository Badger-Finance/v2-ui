import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Dialog, DialogContent, DialogTitle, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles({
	title: {
		padding: 25,
	},
	name: {
		marginTop: 18,
	},
	description: {
		fontSize: 12,
	},
	content: {
		padding: '0px 25px 25px 25px',
	},
});

const VaultRewardsInformationPanel = (): JSX.Element => {
	const {
		vaults: { showRewardsInformationPanel, closeRewardsInformationPanel },
	} = useContext(StoreContext);
	const classes = useStyles();

	return (
		<Dialog open={showRewardsInformationPanel} onClose={closeRewardsInformationPanel}>
			<DialogTitle disableTypography className={classes.title}>
				<Typography variant="h5">Rewards</Typography>
			</DialogTitle>
			<DialogContent className={classes.content}>
				<Typography variant="body1">Autocompounder:</Typography>
				<Typography className={classes.description}>
					All rewards from the vault’s strategy are sold for more of the underlying asset, increasing the
					value of your position. Autocompounders are a good fit for depositors who want more of the assets
					that are contained in the vault.
				</Typography>
				<Typography variant="body1" className={classes.name}>
					Bitcoin Rewards:
				</Typography>
				<Typography className={classes.description}>
					Stacking Bitcoin is a priority for many people in our community. These vaults sell all of the
					rewards the strategy earns for Bitcoin. This Bitcoin comes in the form of a Badger vault, which
					earns even more Bitcoin by autocompounding its own rewards.
				</Typography>
				<Typography variant="body1" className={classes.name}>
					Ecosystem Rewards:
				</Typography>
				<Typography className={classes.description}>
					Many of the DeFi platforms that Badger vaults interact with give rewards in the form of tokens that
					have utility within their ecosystem. Depositors who want to accumulate these tokens may want to
					consider Ecosystem Rewards vaults. Each token is distributed as an associated Ecosystem Helper
					vault, which optimally handles the token for you while earning even more rewards.
				</Typography>
				<Typography variant="body1" className={classes.name}>
					Ecosystem Helper:
				</Typography>
				<Typography className={classes.description}>
					The tokens earned by Ecosystem Rewards vaults have the ability to earn additional rewards, provided
					that they are deployed productively. Ecosystem Helper vaults automate this process for you,
					eliminating the complexity and cost of doing it yourself.
				</Typography>
			</DialogContent>
		</Dialog>
	);
};

export default observer(VaultRewardsInformationPanel);
