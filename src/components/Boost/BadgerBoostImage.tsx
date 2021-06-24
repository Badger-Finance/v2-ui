import React from 'react';
import { BoxProps } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = (backgroundColor: string) => {
	return makeStyles(() => ({
		container: {
			width: '100%',
			height: '100%',
			margin: 'auto',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			position: 'relative',
			background: backgroundColor,
		},
		boostImage: {
			width: '60%',
		},
	}));
};

interface Props extends BoxProps {
	backgroundColor: string;
}

export const BadgerBoostImage = ({ backgroundColor, className, ...boxProps }: Props): JSX.Element => {
	const classes = useStyles(backgroundColor)();

	return (
		<div className={clsx(className, classes.container)} {...boxProps}>
			<img alt="Badger Logo" src={'assets/badger-transparent.png'} className={classes.boostImage} />
		</div>
	);
};
