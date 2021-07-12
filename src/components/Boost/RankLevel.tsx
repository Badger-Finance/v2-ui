import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import { BadgerBoostImage } from './BadgerBoostImage';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	root: {
		textAlign: 'start',
	},
	fullWidthImage: {
		width: '100%',
		height: '100%',
	},
	badgerLevelInfoContainer: {
		margin: '8px 0px',
	},
	badgerLevelBoost: {
		fontSize: 10,
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.common.black,
		padding: 2,
	},
	boostImage: {
		width: '60%',
	},
	boostImageContainer: {
		width: 40,
		height: 40,
		margin: '8px 8px 8px 0px',
	},
	locked: {
		opacity: 0.5,
	},
	badgerLevelConnector: {
		width: 5,
		height: 2,
		marginLeft: 2,
		marginRight: 8,
		background: 'rgba(255, 255, 255, 0.1)',
	},
	softBorder: {
		borderRadius: 2,
	},
	obtained: {
		border: `2px solid ${theme.palette.primary.main}`,
	},
}));

interface Props {
	name: string;
	boost: number;
	obtained?: boolean;
	locked?: boolean;
}

export const RankLevel = ({ name, boost, obtained = false, locked = true }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container className={clsx(locked && classes.locked, classes.root)}>
			<div className={clsx(classes.boostImageContainer)}>
				<BadgerBoostImage className={clsx(classes.softBorder, obtained && classes.obtained)} boost={boost} />
			</div>
			<div className={classes.badgerLevelInfoContainer}>
				<Typography variant="body2">{name}</Typography>
				<Typography display="inline" className={classes.badgerLevelBoost}>{`${boost.toFixed(2)}x`}</Typography>
			</div>
		</Grid>
	);
};
