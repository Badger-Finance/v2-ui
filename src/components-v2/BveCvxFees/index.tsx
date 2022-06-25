import React from 'react';
import { Box, Grid, makeStyles, Typography } from '@material-ui/core';
import { StyledDivider, StyledHelpIcon } from '../vault-detail/styled';
import SpecItem from '../vault-detail/specs/SpecItem';
import { getStrategyFee } from '../../mobx/utils/fees';
import { VaultDTO } from '@badger-dao/sdk';
import { StrategyFee } from '../../mobx/model/system-config/stategy-fees';
import { formatStrategyFee } from '../../utils/componentHelpers';
import influenceFees from 'config/bve-cvx/vote-influence-fees.json';

const useStyles = makeStyles((theme) => ({
	title: {
		paddingBottom: theme.spacing(0.15),
		fontSize: '1.25rem',
	},
	spec: {
		fontSize: 12,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: theme.spacing(0.5),
	},
	subSpec: {
		paddingLeft: 15,
		marginBottom: theme.spacing(0.5),
	},
}));

interface Props {
	vault: VaultDTO;
}

const BveCvxFees = ({ vault }: Props): JSX.Element => {
	const classes = useStyles();
	const withdrawFee = getStrategyFee(vault, StrategyFee.withdraw);

	return (
		<Grid container>
			<Typography variant="h6" className={classes.title}>
				Fees
			</Typography>
			<StyledDivider />
			<Grid container direction="column">
				<Grid item container>
					<Typography display="inline" color="textSecondary" className={classes.spec}>
						Vote Influence Fees
						<StyledHelpIcon />
					</Typography>
					<Grid container direction="column">
						{Object.entries(influenceFees).map(([key, value]) => (
							<SpecItem key={key} className={classes.subSpec} name={key} value={value} />
						))}
					</Grid>
				</Grid>
				<Grid item container justifyContent="space-between">
					<SpecItem
						name={
							<Box component="span" display="flex" justifyContent="center" alignItems="center">
								Withdrawal Fee
								<StyledHelpIcon />
							</Box>
						}
						value={formatStrategyFee(withdrawFee)}
					/>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default BveCvxFees;
