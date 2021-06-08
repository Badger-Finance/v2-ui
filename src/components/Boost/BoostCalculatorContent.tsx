/* eslint-disable react/prop-types */
import React from 'react';
import { Box, Grid, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BoostBadgerAnimation } from './BoostBadgerAnimation';
import { BoostSlider } from './BoostSlider';
import { BorderedText } from './Common';

const useStyles = makeStyles((theme) => ({
	content: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(3),
		[theme.breakpoints.down('sm')]: {
			marginBottom: 0,
		},
	},
	boostSlider: {
		padding: '0 22px !important',
		height: 'auto !important',
	},
	settInformation: {
		textAlign: 'center',
	},
}));

type BoostCalculatorContainerProps = {
	native: number;
	nonNative: number;
	onNativeChange(value: number): void;
	onNonNativeChange(value: number): void;
};

export const BoostCalculatorContainer: React.FC<BoostCalculatorContainerProps> = ({
	native,
	nonNative,
	onNonNativeChange,
	onNativeChange,
}) => {
	const classes = useStyles();
	const theme = useTheme();
	const smallScreen = useMediaQuery(theme.breakpoints.down(706));

	const handleNativeSliderChange = (event: Event, slideValue: number) => onNativeChange(slideValue);
	const handleNonNativeSliderChange = (event: Event, slideValue: number) => onNonNativeChange(slideValue);

	const badgerSliders = (
		<Box display="flex" flexDirection="row" alignItems="stretch" justifyContent="center">
			<BoostSlider className={classes.boostSlider} value={native} onChange={handleNativeSliderChange as any} />
			<BoostBadgerAnimation value={native} />
			<BoostSlider
				className={classes.boostSlider}
				value={nonNative}
				onChange={handleNonNativeSliderChange as any}
			/>
		</Box>
	);
	const nativeBox = (
		<Grid item className={classes.settInformation}>
			<Typography variant="h6">Native: </Typography>
			<BorderedText variant="h6">$5,000</BorderedText>
		</Grid>
	);
	const nonNativeBox = (
		<Grid item className={classes.settInformation}>
			<Typography variant="h6">Non Native: </Typography>
			<BorderedText variant="h6">$10,000</BorderedText>
		</Grid>
	);

	if (smallScreen) {
		return (
			<Grid container spacing={4} className={classes.content} alignItems="center" justify="center">
				<Grid item xs={12}>
					{badgerSliders}
				</Grid>
				<Grid item xs={6}>
					{nativeBox}
				</Grid>
				<Grid item xs={6}>
					{nonNativeBox}
				</Grid>
			</Grid>
		);
	}

	return (
		<Grid container className={classes.content} alignItems="center" justify="center">
			<Grid item xs>
				{nativeBox}
			</Grid>
			<Grid item xs={7}>
				{badgerSliders}
			</Grid>
			<Grid item xs>
				{nonNativeBox}
			</Grid>
		</Grid>
	);
};
