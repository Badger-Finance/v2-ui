import React, { MouseEvent, useContext } from 'react';
import { VaultDTO, VaultState } from '@badger-dao/sdk';
import {
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	IconButton,
	makeStyles,
	Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { numberWithCommas } from '../../mobx/utils/helpers';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';
import { toJS } from 'mobx';
import VaultApyBreakdownItem from '../VaultApyBreakdownItem';
import VaultListItemTags from '../VaultListItemTags';

const useStyles = makeStyles((theme) => ({
	root: {
		maxWidth: 516,
	},
	tag: {
		backgroundColor: theme.palette.common.black,
		color: theme.palette.primary.main,
		textTransform: 'capitalize',
	},
	closeIcon: {
		marginRight: -12,
	},
	divider: {
		width: '100%',
		margin: '9px 0px',
	},
	title: {
		padding: '27px 36px 36px 36px',
	},
	content: {
		padding: '0px 36px 27px 36px',
	},
	button: {
		marginTop: 34,
	},
}));

interface Props {
	open: boolean;
	vault: VaultDTO;
	boost: number;
	onClose: () => void;
}

const VaultApyInformation = ({ open, onClose, boost, vault }: Props): JSX.Element => {
	const {
		vaults,
		user: { accountDetails },
		router,
	} = useContext(StoreContext);
	const classes = useStyles();
	const multiplier =
		vault.state !== VaultState.Deprecated ? accountDetails?.multipliers[vault.vaultToken] : undefined;
	const sources = vaults.vaultsFilters.showAPR ? vault.sources : vault.sourcesApy;

	//make sure boost source it always the last one
	const sortedSources = sources.sort((a) => (a.name === 'Boosted Badger Rewards' ? 1 : -1));

	if (open) {
		console.log(toJS(sources));
	}

	const handleGoToVault = async (event: MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		await router.goTo(routes.settDetails, { settName: vaults.getSlug(vault.vaultToken) });
	};

	const handleClose = (event: MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClick={(e) => e.stopPropagation()}
			onClose={onClose}
			fullWidth
			classes={{ paper: classes.root }}
		>
			<DialogTitle disableTypography className={classes.title}>
				<Grid direction="column">
					<Grid item container justifyContent="space-between" alignItems="center">
						<Grid item xs="auto">
							<Typography variant="h5" display="inline">
								{vault.name}
							</Typography>
						</Grid>
						<Grid item xs="auto">
							<IconButton onClick={handleClose} className={classes.closeIcon}>
								<CloseIcon />
							</IconButton>
						</Grid>
					</Grid>
					<Grid item container>
						<VaultListItemTags vault={vault} spacing={1} />
					</Grid>
				</Grid>
			</DialogTitle>
			<DialogContent className={classes.content}>
				<Grid container direction="column">
					<Grid item container justifyContent="space-between">
						<Grid item>
							<Typography variant="subtitle1" display="inline" color="textSecondary">
								{vaults.vaultsFilters.showAPR ? 'APR' : 'APY'}
							</Typography>
						</Grid>
						<Grid item>
							<Typography variant="subtitle1" display="inline" color="textSecondary">
								{`${numberWithCommas(boost.toFixed(2))}%`}
							</Typography>
						</Grid>
					</Grid>
					<Divider className={classes.divider} />
					{sortedSources.map((source) => (
						<>
							<VaultApyBreakdownItem
								key={source.name}
								vault={vault}
								source={source}
								multiplier={multiplier ?? 1}
							/>
							<Divider className={classes.divider} />
						</>
					))}
					<Grid item className={classes.button}>
						<Button color="primary" variant="contained" fullWidth onClick={handleGoToVault}>
							GO TO VAULT
						</Button>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
};

export default observer(VaultApyInformation);
