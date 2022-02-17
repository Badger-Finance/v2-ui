import React from 'react';
import { Divider, Tooltip, Typography } from '@material-ui/core';
import HelpIcon from '@material-ui/icons/Help';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { StrategyFees } from './StrategyFees';
import { Vault } from '@badger-dao/sdk';
import { ethers } from 'ethers';
import { getStrategies } from 'config/system/strategies';
import { StrategyFee } from 'mobx/model/system-config/stategy-fees';
import { getVaultStrategyFee } from 'mobx/utils/fees';
import { StrategyConfig } from 'mobx/model/strategies/strategy-config';

const useStyles = makeStyles((theme) => ({
	specName: {
		fontSize: 12,
		lineHeight: '1.66',
	},
	divider: {
		width: '100%',
		marginBottom: theme.spacing(1),
	},
	titleContainer: {
		display: 'flex',
		alignItems: 'center',
	},
	help: {
		width: 12,
		height: 12,
	},
	helpIcon: {
		fontSize: 16,
		marginLeft: theme.spacing(1),
		cursor: 'pointer',
		color: 'rgba(255, 255, 255, 0.3)',
	},
}));

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	vault: Vault;
	onHelpClick?: () => void;
	showNoFees?: boolean;
}

export const VaultFees = observer(
	({ vault, onHelpClick, showNoFees = true, ...rootProps }: Props): JSX.Element | null => {
		const classes = useStyles();
		const store = React.useContext(StoreContext);
		const { network: networkStore } = store;
		const { network } = networkStore;
		const { strategy } = vault;

		const defaultFees = network.strategies[vault.vaultToken].fees;

		let totalFees = 0;
		if (strategy && strategy.address !== ethers.constants.AddressZero) {
			for (const fee of Object.values(StrategyFee)) {
				const feesAmount = getVaultStrategyFee(strategy, fee);
				if (feesAmount && feesAmount > 0) {
					totalFees++;
				}
			}
		} else {
			for (const fee of Object.values(StrategyFee)) {
				const feeAmount = defaultFees[fee];
				if (feeAmount && feeAmount.gt(0)) {
					totalFees++;
				}
			}
		}

		if (totalFees === 0) {
			return (
				<div {...rootProps}>
					<Typography>Fees</Typography>
					<Divider className={classes.divider} />
					<Typography className={classes.specName} color="textSecondary" display="inline">
						There are no fees for this vault
					</Typography>
				</div>
			);
		}

		return (
			<div {...rootProps}>
				<div className={classes.titleContainer}>
					<Typography>Fees</Typography>
					{onHelpClick && (
						<Tooltip
							enterTouchDelay={0}
							color="primary"
							arrow
							placement="top"
							title="Click to see full description"
						>
							<HelpIcon
								className={classes.helpIcon}
								onClick={onHelpClick}
								aria-label="see fees descriptions"
							/>
						</Tooltip>
					)}
				</div>
				<Divider className={classes.divider} />
				<StrategyFees vault={vault} fees={defaultFees} />
			</div>
		);
	},
);
