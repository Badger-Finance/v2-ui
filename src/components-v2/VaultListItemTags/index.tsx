import React, { MouseEvent, useContext } from 'react';
import { VaultBehavior, VaultDTO, VaultState } from '@badger-dao/sdk';
import { Chip, Grid, GridProps, makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
	tag: {
		backgroundColor: theme.palette.common.black,
		color: theme.palette.primary.main,
		textTransform: 'capitalize',
		cursor: 'pointer',
	},
	label: {
		marginRight: 5,
	},
}));

interface Props extends GridProps {
	vault: VaultDTO;
	showLabels?: boolean;
}

const VaultListItemTags = ({ vault, showLabels = false, ...gridProps }: Props): JSX.Element => {
	const { vaults } = useContext(StoreContext);
	const classes = useStyles();

	const handleStatusClick = (event: MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		vaults.openStatusInformationPanel();
	};

	const handleRewardsClick = (event: MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		vaults.openRewardsInformationPanel();
	};

	return (
		<Grid container spacing={2} {...gridProps}>
			{vault.state !== VaultState.Open && (
				<Grid item xs="auto" onClick={handleStatusClick}>
					{showLabels && (
						<Typography display="inline" variant={'caption'} className={classes.label}>
							Status:
						</Typography>
					)}
					<Chip size="small" label={vault.state} className={classes.tag} />
				</Grid>
			)}
			{vault.behavior !== VaultBehavior.None && (
				<Grid item xs="auto" onClick={handleRewardsClick}>
					{showLabels && (
						<Typography display="inline" variant={'caption'} className={classes.label}>
							Rewards:
						</Typography>
					)}
					<Chip size="small" label={vault.behavior} className={classes.tag} />
				</Grid>
			)}
			<Grid item xs="auto">
				{showLabels && (
					<Typography display="inline" variant={'caption'} className={classes.label}>
						Platform:
					</Typography>
				)}
				<Chip size="small" label={vault.protocol} className={classes.tag} />
			</Grid>
			{vault.boost.enabled && (
				<Grid item xs="auto">
					{showLabels && (
						<Typography display="inline" variant={'caption'} className={classes.label}>
							Boost:
						</Typography>
					)}
					<Chip size="small" label="🚀 Boosted" className={classes.tag} />
				</Grid>
			)}
		</Grid>
	);
};

export default observer(VaultListItemTags);
