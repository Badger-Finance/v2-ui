import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.primary.main,
		borderRadius: 8,
		width: 240,
		height: 240,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	boost: {
		display: 'flex',
		borderRadius: '8px',
		justifyContent: 'center',
		alignItems: 'center',
	},
	boostImage: {
		width: '60%',
	},
	boostEye: {
		width: '30px',
		height: '30px',
		borderRadius: '9999px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		background: 'radial-gradient(rgba(255,255,255,0.2),hsla(33deg,88%,56%,0))',
		top: '46%',
		mixBlendMode: 'hard-light',
		transformOrigin: 'center',
	},
	boostLeft: {
		left: '31.5%',
	},
	boostRight: {
		right: '31.5%',
	},
	boostEyeStar: {
		position: 'absolute',
		width: '20%',
	},
}));

type BoostBadgeProps = {
	value: number;
};

const useAnimatedStyles = (value: number) => {
	const hue = 33 + value * 3.27;
	const opacity = value * 0.01;
	const scale = 0.75 + value / 40;

	return makeStyles(() => ({
		container: {
			background: `hsl(${hue}deg,88%,56%)`,
		},
		eyes: {
			transform: `scale(${scale})`,
			animation: '$glow 1.5s ease-in-out infinite alternate',
			background: `radial-gradient(hsla(${hue}deg,100%,76%,${opacity}),hsla(${hue}deg,88%,56%,0) 80%)`,
		},
		'@keyframes glow': {
			'0%': { transform: `scale(${scale})` },
			'100%': { transform: `scale(${scale * 0.8})` },
		},
	}));
};

export const BoostBadgerAnimation = ({ value }: BoostBadgeProps): JSX.Element => {
	const classes = useStyles();
	const animatedClasses = useAnimatedStyles(value)();

	const eyesImage = <img src={'assets/badger-eyes.png'} alt="Badger Eyes" className={classes.boostEyeStar} />;

	return (
		<Box className={[classes.root, animatedClasses.container].join(' ')}>
			<div className={[classes.boostEye, classes.boostLeft, animatedClasses.eyes].join(' ')}>{eyesImage}</div>
			<img alt="Badger Logo" src={'assets/badger-transparent.png'} className={classes.boostImage} />
			<div className={[classes.boostEye, classes.boostRight, animatedClasses.eyes].join(' ')}>{eyesImage}</div>
		</Box>
	);
};
