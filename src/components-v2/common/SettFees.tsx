import React from 'react';
import { Divider, Tooltip, Typography } from '@material-ui/core';
import HelpIcon from '@material-ui/icons/Help';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { getNonEmptyStrategyFees } from '../../mobx/utils/fees';
import { StrategyFees } from './StrategyFees';
import { Vault } from '@badger-dao/sdk';

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
	sett: Vault;
	onHelpClick?: () => void;
	showNoFees?: boolean;
}

export const SettFees = observer(
	({ sett, onHelpClick, showNoFees = true, ...rootProps }: Props): JSX.Element | null => {
		const store = React.useContext(StoreContext);
		const { network: networkStore } = store;
		const { network } = networkStore;

		const classes = useStyles();

		const noFees = (
			<div {...rootProps}>
				<Typography>Fees</Typography>
				<Divider className={classes.divider} />
				<Typography className={classes.specName} color="textSecondary" display="inline">
					There are no fees for this vault
				</Typography>
			</div>
		);

		const networkSett = network.setts.find(({ vaultToken }) => vaultToken.address === sett.vaultToken);

		if (!networkSett) {
			return showNoFees ? noFees : null;
		}

		const settStrategy = network.strategies[networkSett.vaultToken.address];
		const nonEmptyFees = getNonEmptyStrategyFees(settStrategy);

		if (nonEmptyFees.length == 0) {
			return showNoFees ? noFees : null;
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
				<StrategyFees sett={sett} strategy={settStrategy} />
			</div>
		);
	},
);
