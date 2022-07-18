import React, { useState } from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { StyledDivider, StyledHelpIcon } from '../vault-detail/styled';
import SpecItem from '../vault-detail/specs/SpecItem';
import { getStrategyFee } from '../../mobx/utils/fees';
import { VaultDTO } from '@badger-dao/sdk';
import { StrategyFee } from '../../mobx/model/system-config/stategy-fees';
import { formatStrategyFee } from '../../utils/componentHelpers';
import InfluenceVaultModal from './InfluenceVaultModal';
import { getInfluenceVaultConfig } from './InfluenceVaultUtil';

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

const InfluenceVaultFees = ({ vault }: Props): JSX.Element => {
	const classes = useStyles();
	const [infoDialogOpen, setInfoDialogOpen] = useState(false);
	const withdrawFee = getStrategyFee(vault, StrategyFee.withdraw);
	const info = getInfluenceVaultConfig(vault.vaultToken);

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
						<StyledHelpIcon onClick={() => setInfoDialogOpen(true)} />
					</Typography>
					<Grid container direction="column">
						{info.feeInfo.fees.map((fee: string[], index: number) => (
							<SpecItem key={index} className={classes.subSpec} name={fee[0]} value={fee[1]} />
						))}
					</Grid>
				</Grid>
				<Grid item container justifyContent="space-between">
					<SpecItem name="Withdrawal Fee" value={formatStrategyFee(withdrawFee)} />
				</Grid>
			</Grid>
			<InfluenceVaultModal
				open={infoDialogOpen}
				onClose={() => setInfoDialogOpen(false)}
				info={info.feeInfo.feeModalInfo}
			/>
		</Grid>
	);
};

export default InfluenceVaultFees;
