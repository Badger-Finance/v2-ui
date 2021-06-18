import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	fullWidthImage: {
		width: '100%',
		height: '100%',
	},
	badgerLevelItem: {
		'&:not(:first-child)': {
			marginTop: theme.spacing(2),
		},
	},
	badgerLevelImgContainer: {
		width: 40,
		height: 40,
		margin: 'auto 8px auto 0',
		borderRadius: 2,
	},
	badgerLevelBoost: {
		fontSize: 10,
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.common.black,
		padding: 2,
		borderRadius: 2,
	},
	badgerLevelConnector: {
		width: 16,
		height: 2,
		background: 'rgba(255, 255, 255, 0.1)',
	},
}));

const useBoostLevelClasses = (boost: number) => {
	return makeStyles((theme) => ({
		levelImgBorder: {
			border: [1.0, 1.25].includes(boost) ? `1px solid ${theme.palette.primary.main}` : 'initial',
		},
		connectorColor: {
			background: [1.0, 1.25].includes(boost)
				? theme.palette.primary.main
				: boost === 1.5
				? '#74D189'
				: 'initial',
		},
	}));
};

interface Props {
	name: string;
	img: string;
	boost: number;
}

export const BadgerBoostLevel = ({ name, img, boost }: Props): JSX.Element => {
	const commonClasses = useStyles();
	const boostLevelClasses = useBoostLevelClasses(boost)();

	return (
		<Grid container className={commonClasses.badgerLevelItem} alignItems="center">
			<div className={clsx(commonClasses.badgerLevelConnector, boostLevelClasses.connectorColor)} />
			<div className={clsx(commonClasses.badgerLevelImgContainer, boostLevelClasses.levelImgBorder)}>
				<img className={commonClasses.fullWidthImage} src={img} alt={`${name} img`} />
			</div>
			<div>
				<Typography variant="body2">{name}</Typography>
				<Typography display="inline" className={commonClasses.badgerLevelBoost}>{`${boost.toFixed(
					2,
				)}x`}</Typography>
			</div>
		</Grid>
	);
};
