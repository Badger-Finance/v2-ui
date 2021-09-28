import React, { useState } from 'react';
import { Collapse, Grid, makeStyles, Typography } from '@material-ui/core';
import { Sett } from '../../../mobx/model/setts/sett';
import { BadgerSett } from '../../../mobx/model/vaults/badger-sett';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { StyledDivider } from '../styled';
import SettDetailLink from './SettDetailLink';

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
	sett: Sett;
	badgerSett: BadgerSett;
}

const SettDetailLinks = observer(
	({ sett, badgerSett }: Props): JSX.Element => {
		const classes = useStyles();
		const { network: networkStore } = React.useContext(StoreContext);
		const { network } = networkStore;

		const vaultAddress = badgerSett.vaultToken.address;
		const strategy = network.strategies[vaultAddress];
		const underlyingToken = sett.underlyingToken;
		const hasBaseLink = !!(strategy.userGuide || strategy.strategyLink || strategy.depositLink);

		const [expanded, setExpanded] = useState(!hasBaseLink);
		const expandText = expanded ? 'Hide' : 'Show More';
		const strategyAddress = sett.strategy?.address ?? network.strategies[sett.vaultToken].address;

		return (
			<Grid container className={classes.linksContainer}>
				<Typography>Links</Typography>
				<StyledDivider />
				{strategy.userGuide && <SettDetailLink title="User Guide" href={strategy.userGuide} />}
				{strategy.strategyLink && <SettDetailLink title="Strategy Diagram" href={strategy.strategyLink} />}
				{strategy.depositLink && <SettDetailLink title="Get Deposit Token" href={strategy.depositLink} />}
				<Collapse in={expanded}>
					<SettDetailLink title="Vault Address" href={`${network.explorer}/address/${vaultAddress}`} />
					<SettDetailLink title="Strategy Address" href={`${network.explorer}/address/${strategyAddress}`} />
					<SettDetailLink
						title="Underlying Token Address"
						href={`${network.explorer}/address/${underlyingToken}`}
					/>
				</Collapse>
				<div className={classes.showMoreContainer}>
					<div className={classes.showMore} onClick={() => setExpanded(!expanded)}>
						{expandText}
					</div>
				</div>
			</Grid>
		);
	},
);

export default SettDetailLinks;
