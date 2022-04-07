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

const VaultStatusInformationPanel = (): JSX.Element => {
	const {
		vaults: { showStatusInformationPanel, closeStatusInformationPanel },
	} = useContext(StoreContext);
	const classes = useStyles();

	return (
		<Dialog open={showStatusInformationPanel} onClose={closeStatusInformationPanel}>
			<DialogTitle disableTypography className={classes.title}>
				<Typography variant="h5">Vault Status</Typography>
			</DialogTitle>
			<DialogContent className={classes.content}>
				<Typography variant="body1">Guarded:</Typography>
				<Typography className={classes.description}>
					Guarded vaults have caps on both user and vault deposits during the initial launch phase. In some
					cases, a whitelist may be imposed which limits deposits to a specific group of eligible users. These
					measures are put in place when deploying new products to limit the impact of any security
					vulnerabilities and act as a warning to users of the potential risks involved.
				</Typography>
				<Typography variant="body1" className={classes.name}>
					Featured:
				</Typography>
				<Typography className={classes.description}>
					Featured vaults are new or noteworthy. They’re what we’re most excited about at the moment. These
					vaults have graduated from their Guarded phase and are available to all depositors. If you need a
					little guidance on which opportunities to choose from, Featured vaults are a good place to start.
				</Typography>
				<Typography variant="body1" className={classes.name}>
					Discontinued:
				</Typography>
				<Typography className={classes.description}>
					Discontinued vaults are no longer being serviced by Badger. They have successfully graduated from an
					expiring state. Emissions have been cut and rewards are no longer harvested. While in this state,
					funds are totally safe and users have the ability to withdraw at any time, however, no new deposits
					will be permitted.
				</Typography>
			</DialogContent>
		</Dialog>
	);
};

export default observer(VaultStatusInformationPanel);
