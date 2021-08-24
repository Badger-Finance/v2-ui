import React from 'react';
import clsx from 'clsx';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';

const useStyles = makeStyles((theme) => ({
	apyBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		maxHeight: 24,
		fontSize: 12,
		borderRadius: 4,
		padding: 4,
		color: theme.palette.common.black,
		marginLeft: theme.spacing(1),
	},
	apyText: {
		marginLeft: 4,
	},
	increasedApy: {
		backgroundColor: '#74D189',
	},
	reducedApy: {
		backgroundColor: theme.palette.error.main,
	},
	neutralApy: {
		backgroundColor: theme.palette.primary.main,
	},
}));

interface Props {
	apyComparison: string;
	mode: ComparisonMode;
}

export enum ComparisonMode {
	positive = 'positive',
	negative = 'negative',
	neutral = 'neutral',
}

export default function ApyDisplayBadge({ apyComparison, mode }: Props): JSX.Element {
	const classes = useStyles();

	const badgeStylesByMode = {
		positive: classes.increasedApy,
		negative: classes.reducedApy,
		neutral: classes.neutralApy,
	};

	const badgeIconsByMode = {
		positive: <TrendingUpIcon />,
		negative: <TrendingDownIcon />,
		neutral: <TrendingFlatIcon />,
	};

	return (
		<Typography className={clsx(classes.apyBadge, badgeStylesByMode[mode])}>
			{badgeIconsByMode[mode]}
			<span className={classes.apyText}>{apyComparison}</span>
		</Typography>
	);
}
