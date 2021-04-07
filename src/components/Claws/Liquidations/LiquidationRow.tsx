import React from 'react';
import { TableCell, Typography, Grid, makeStyles, TableRow, IconButton } from '@material-ui/core';
import { UnfoldMoreTwoTone } from '@material-ui/icons';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { LiquidationStatus } from './LiquidationStatus';
import { Liquidation, SyntheticData } from 'mobx/model';
import { Direction, scaleToString } from 'utils/componentHelpers';

dayjs.extend(utc);

interface Props {
	liquidation: Liquidation;
	synthetic: SyntheticData;
	decimals: number;
	onClick: () => void;
}

export const useStyles = makeStyles((theme) => ({
	tableRow: {
		cursor: 'pointer',
		'&:last-child td, &:last-child th': {
			border: 0,
			borderBottomLeftRadius: 4,
			borderBottomRightRadius: 4,
		},
	},
	tableRowSubdued: {
		'& .MuiTableCell-head': {
			color: theme.palette.text.secondary,
		},
	},
}));

export const LiquidationRow = ({ liquidation, synthetic, decimals, onClick }: Props) => {
	const classes = useStyles();
	const { lockedCollateral, liquidatedCollateral, liquidationTime, state, settlementPrice } = liquidation;

	return (
		<TableRow hover={true} className={classes.tableRow}>
			<TableCell onClick={onClick}>
				<Typography variant="body1">{synthetic.name}</Typography>
			</TableCell>
			<TableCell onClick={onClick}>{scaleToString(settlementPrice, decimals, Direction.Down)}</TableCell>
			<TableCell onClick={onClick}>
				<Grid container alignItems="center">
					<Grid item style={{ marginRight: '0.25rem' }}>
						<Typography variant="body2">
							{scaleToString(lockedCollateral, decimals, Direction.Down)}
						</Typography>
					</Grid>
					<Grid item>
						<Typography variant="body2" color={'textSecondary'}>
							{`/${scaleToString(liquidatedCollateral, decimals, Direction.Down)}`}
						</Typography>
					</Grid>
				</Grid>
			</TableCell>
			<TableCell onClick={onClick}>{dayjs(liquidationTime.toNumber() * 1000).format('MMM DD, YYYY')}</TableCell>
			<TableCell onClick={onClick}>
				<LiquidationStatus liquidation={liquidation} synthetic={synthetic} />
			</TableCell>
			<TableCell onClick={onClick} align="right">
				<IconButton color="default">
					<UnfoldMoreTwoTone />
				</IconButton>
			</TableCell>
		</TableRow>
	);
};
