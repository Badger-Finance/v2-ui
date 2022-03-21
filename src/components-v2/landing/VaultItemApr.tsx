import React, { useContext } from 'react';
import { Tooltip, Typography } from '@material-ui/core';
import VaultItemRoiTooltip from './VaultItemRoiTooltip';
import { makeStyles } from '@material-ui/core/styles';
import { Vault, VaultState } from '@badger-dao/sdk';
import { numberWithCommas } from 'mobx/utils/helpers';
import { observable } from 'mobx';
import { StoreContext } from 'mobx/store-context';

const useStyles = makeStyles({
	apr: {
		cursor: 'default',
		fontSize: 16,
	},
	boost: {
		fontWeight: 400,
		cursor: 'default',
	},
});

interface Props {
	vault: Vault;
	boost: number | null;
	isDisabled?: boolean;
}

const VaultItemApr = ({ vault, boost }: Props): JSX.Element => {
	const { user } = useContext(StoreContext);
	const classes = useStyles();
	const multiplier =
		vault.state !== VaultState.Deprecated ? user.accountDetails?.multipliers[vault.vaultToken] : undefined;

	if (!vault.apr) {
		return (
			<Typography className={classes.apr} variant="body1" color={'textPrimary'}>
				--%
			</Typography>
		);
	}

	return (
		<Tooltip
			enterTouchDelay={0}
			enterDelay={0}
			leaveDelay={300}
			arrow
			placement="left"
			title={<VaultItemRoiTooltip vault={vault} multiplier={multiplier} />}
			// prevents scrolling overflow off the sett list
			PopperProps={{
				disablePortal: true,
			}}
			// needs to be set otherwise MUI will set a random one on every run causing snapshots to break
			id={`${vault.name} apr breakdown`}
		>
			<Typography className={classes.apr} variant="body1" color={'textPrimary'}>
				{`${numberWithCommas((boost ?? vault.apr).toFixed(2))}%`}
			</Typography>
		</Tooltip>
	);
};

export default observable(VaultItemApr);
