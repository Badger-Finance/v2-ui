import React from 'react';
import { Grid, Link, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SettActionButton } from '../../common/SettActionButtons';
import { Sett } from '../../../mobx/model/setts/sett';
import { BadgerSett } from '../../../mobx/model/vaults/badger-sett';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(4),
	},
	description: {
		marginTop: theme.spacing(1),
	},
	depositContainer: {
		display: 'flex',
		alignItems: 'center',
		paddingLeft: theme.spacing(4),
	},
	depositLink: {
		textDecoration: 'underline',
	},
}));

interface Props {
	sett: Sett;
	badgerSett: BadgerSett;
}

export const NoHoldings = observer(
	({ sett, badgerSett }: Props): JSX.Element => {
		const store = React.useContext(StoreContext);
		const { network: networkStore, settDetail } = store;
		const { network } = networkStore;
		const classes = useStyles();

		const strategy = network.strategies[badgerSett.vaultToken.address];

		return (
			<Grid container className={classes.root} component={Paper}>
				<Grid item xs={12} sm={8}>
					<Typography variant="body1">{`You have no ${sett.name} in your connected wallet.`}</Typography>
					{strategy.depositInstructions && (
						<Typography variant="body2" className={classes.description}>
							{strategy.depositInstructions}
						</Typography>
					)}
					{strategy.depositLink && (
						<>
							<Typography variant="body2" className={classes.description}>
								You can obtain deposit tokens by using the following link:
							</Typography>
							<Link
								className={classes.depositLink}
								target="_blank"
								rel="noreferrer"
								href={strategy.depositLink}
							>
								Get Deposit Token
							</Link>
						</>
					)}
				</Grid>
				<Grid item xs={12} sm className={classes.depositContainer}>
					<SettActionButton
						color="primary"
						variant="contained"
						fullWidth
						onClick={() => settDetail.toggleDepositDialog()}
					>
						Deposit
					</SettActionButton>
				</Grid>
			</Grid>
		);
	},
);
