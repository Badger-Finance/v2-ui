import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { StyledDivider } from '../styled';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { Sett } from '../../../mobx/model/setts/sett';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles(() => ({
	specName: {
		fontSize: 12,
		lineHeight: '1.66',
	},
}));

interface Props {
	sett: Sett;
}

const formatStrategyFee = (fee: BigNumber) => `${fee.dividedBy(10 ** 2).toString()}%`;

export const Fees = observer(
	({ sett }: Props): JSX.Element => {
		const store = React.useContext(StoreContext);
		const { network: networkStore } = store;
		const { network } = networkStore;

		const classes = useStyles();

		const noFees = (
			<Grid container>
				<Typography>Fees</Typography>
				<StyledDivider />
				<Typography className={classes.specName} color="textSecondary" display="inline">
					There are no fees for this vault
				</Typography>
			</Grid>
		);

		const networkSett = network.setts.find(({ vaultToken }) => vaultToken.address === sett.vaultToken);

		if (!networkSett) {
			return noFees;
		}

		const settStrategy = network.strategies[networkSett.vaultToken.address];
		const nonEmptyFees = Object.keys(settStrategy.fees).filter((key) => settStrategy.fees[key].gt(0));

		if (nonEmptyFees.length == 0) {
			return noFees;
		}

		return (
			<Grid container>
				<Typography>Fees</Typography>
				<StyledDivider />
				{nonEmptyFees.map((feeKey) => (
					<Grid key={feeKey} container justify="space-between">
						<Typography className={classes.specName} color="textSecondary" display="inline">
							{feeKey}
						</Typography>
						<Typography display="inline" variant="subtitle2">
							{formatStrategyFee(settStrategy.fees[feeKey])}
						</Typography>
					</Grid>
				))}
			</Grid>
		);
	},
);
