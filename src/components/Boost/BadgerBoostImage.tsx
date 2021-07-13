import React from 'react';
import { BoxProps } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = (signatureColor: string) => {
	return makeStyles(() => ({
		container: {
			width: '100%',
			height: '100%',
			margin: 'auto',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			position: 'relative',
			background: signatureColor,
		},
		boostImage: {
			width: '60%',
		},
	}));
};

interface Props extends BoxProps {
	signatureColor: string;
}

export const BadgerBoostImage = ({ signatureColor, className, ...boxProps }: Props): JSX.Element => {
	const classes = useStyles(signatureColor)();

	return (
		<div className={clsx(className, classes.container)} {...boxProps}>
			<img alt="Badger Logo" src={'assets/badger-transparent.png'} className={classes.boostImage} />
		</div>
	);
};
