import React from 'react';
import { BoxProps } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { percentageBetweenRange } from '../../utils/componentHelpers';

const useStyles = (boost: number) => {
	const sanitizedBoost = Math.min(boost, 3);
	const badgerScore = percentageBetweenRange(sanitizedBoost, 3, 1);
	const hue = 33 + badgerScore * 3.27;

	return makeStyles(() => ({
		container: {
			width: '100%',
			height: '100%',
			margin: 'auto',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			position: 'relative',
			background: `hsl(${hue}deg,88%,56%)`,
		},
		boostImage: {
			width: '60%',
		},
	}));
};

interface Props extends BoxProps {
	boost: number;
}

export const BadgerBoostImage = ({ boost, className, ...boxProps }: Props): JSX.Element => {
	const classes = useStyles(boost)();

	return (
		<div className={clsx(className, classes.container)} {...boxProps}>
			<img alt="Badger Logo" src={'assets/badger-transparent.png'} className={classes.boostImage} />
		</div>
	);
};
