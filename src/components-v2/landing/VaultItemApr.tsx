import React, { MouseEvent, useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { VaultDTO } from '@badger-dao/sdk';
import { numberWithCommas } from 'mobx/utils/helpers';
import VaultApyInformation from '../VaultApyInformation';

const useStyles = makeStyles({
	apr: {
		cursor: 'default',
		fontSize: 16,
	},
	boost: {
		fontWeight: 400,
		cursor: 'default',
	},
	apyInfo: {
		marginLeft: 5,
	},
});

interface Props {
	vault: VaultDTO;
	boost: number;
	isDisabled?: boolean;
}

const VaultItemApr = ({ vault, boost }: Props): JSX.Element => {
	const classes = useStyles();
	const [showApyInfo, setShowApyInfo] = useState(false);

	const handleApyInfoClick = (event: MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		setShowApyInfo(true);
	};

	const handleClose = () => {
		setShowApyInfo(false);
	};

	if (!vault.apr) {
		return (
			<Typography className={classes.apr} variant="body1" color={'textPrimary'}>
				--%
			</Typography>
		);
	}

	return (
		<Box display="flex" alignItems="center">
			<Typography className={classes.apr} variant="body1" color={'textPrimary'} display="inline">
				{`${numberWithCommas(boost.toFixed(2))}%`}
			</Typography>
			<img src="/assets/icons/apy-info.svg" className={classes.apyInfo} onClick={handleApyInfoClick} />
			<VaultApyInformation open={showApyInfo} vault={vault} boost={boost} onClose={handleClose} />
		</Box>
	);
};

export default VaultItemApr;
