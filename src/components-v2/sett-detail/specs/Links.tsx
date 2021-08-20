import React from 'react';
import { Grid, Link, Typography } from '@material-ui/core';
import LinkIcon from '@material-ui/icons/Link';

import { Sett } from '../../../mobx/model/setts/sett';
import { BadgerSett } from '../../../mobx/model/vaults/badger-sett';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { makeStyles } from '@material-ui/core/styles';
import { StyledDivider } from '../styled';

const useStyles = makeStyles((theme) => ({
	linkContainer: {
		marginBottom: theme.spacing(0.5),
	},
	link: {
		fontSize: 12,
		marginLeft: theme.spacing(0.5),
	},
	icon: {
		fontSize: 16,
	},
}));

interface Props {
	sett: Sett;
	badgerSett: BadgerSett;
}

export const Links = observer(
	({ sett, badgerSett }: Props): JSX.Element => {
		const { network: networkStore } = React.useContext(StoreContext);
		const { network } = networkStore;

		const classes = useStyles();

		const vaultAddress = badgerSett.vaultToken.address;
		const strategy = network.strategies[vaultAddress];
		const underlyingToken = sett.underlyingToken;

		return (
			<Grid container>
				<Typography>Links</Typography>
				<StyledDivider />
				<Grid container alignItems="center" className={classes.linkContainer}>
					<LinkIcon color="primary" className={classes.icon} />
					<Link
						className={classes.link}
						target="_blank"
						rel="noreferrer"
						href={`${network.explorer}/address/${vaultAddress}`}
					>
						Vault Address
					</Link>
				</Grid>
				<Grid container alignItems="center" className={classes.linkContainer}>
					<LinkIcon color="primary" className={classes.icon} />
					<Link
						className={classes.link}
						target="_blank"
						rel="noreferrer"
						href={`${network.explorer}/address/${strategy.address}`}
					>
						Strategy Address
					</Link>
				</Grid>
				<Grid container alignItems="center" className={classes.linkContainer}>
					<LinkIcon color="primary" className={classes.icon} />
					<Link
						className={classes.link}
						target="_blank"
						rel="noreferrer"
						href={`${network.explorer}/address/${underlyingToken}`}
					>
						Underlying Token Address
					</Link>
				</Grid>
			</Grid>
		);
	},
);
