import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { BadgerBoostImage } from './BadgerBoostImage';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { getColorFromComparison } from './utils';
import { BoostRank } from '../../mobx/model/boost/leaderboard-rank';
import { Skeleton } from '@material-ui/lab';

const useComparedValuesStyles = (currentRatio: number, accountRatio: number) => {
	return makeStyles((theme) => {
		if (isNaN(currentRatio) || isNaN(accountRatio)) {
			return {
				fontColor: {
					color: theme.palette.text.primary,
				},
			};
		}

		return {
			fontColor: {
				color: getColorFromComparison({
					toCompareValue: currentRatio,
					toBeComparedValue: accountRatio,
					greaterCaseColor: '#74D189',
					lessCaseColor: theme.palette.error.main,
					defaultColor: theme.palette.text.primary,
				}),
			},
		};
	});
};

const useStyles = makeStyles((theme) => ({
	currentLevelImgContainer: {
		display: 'inline-block',
		width: 24,
		height: 24,
		margin: 'auto 4px auto 0',
	},
	fullWidthImage: {
		width: '100%',
		height: '100%',
	},
	currentLevelText: {
		fontSize: 12,
	},
	accountInformationContainer: {
		marginTop: theme.spacing(2),
	},
	rankName: {
		fontSize: 16,
		fontWeight: 600,
	},
	informationValueContainer: {
		wordBreak: 'break-all',
	},
	informationValue: {
		fontSize: 16,
		fontWeight: 600,
	},
}));

interface Props {
	currentRank: BoostRank;
	stakeRatio: number;
	accountStakeRatio: number;
	multiplier: number;
	accountMultiplier: number;
	isLoading?: boolean;
}

export const StakeInformationHeader = ({
	currentRank,
	stakeRatio,
	multiplier,
	accountMultiplier,
	accountStakeRatio,
	isLoading = false,
}: Props): JSX.Element => {
	const classes = useStyles();

	const stakeRatioClasses = useComparedValuesStyles(stakeRatio, accountStakeRatio)();
	const multiplierClasses = useComparedValuesStyles(multiplier, accountMultiplier)();

	const stakeRatioInformation = `${Number(stakeRatio.toFixed(2))}%`;
	const multiplierInformation = `${multiplier}x`;

	return (
		<Grid container>
			<Grid container alignItems="center">
				<div className={classes.currentLevelImgContainer}>
					<BadgerBoostImage signatureColor={currentRank.signatureColor} />
				</div>
				<Typography display="inline" className={classes.rankName}>
					{currentRank.name}
				</Typography>
			</Grid>
			<Grid container className={classes.accountInformationContainer}>
				<Grid container item xs={6}>
					<Grid item xs={12}>
						<Typography variant="subtitle2" color="textSecondary">
							Stake Ratio:
						</Typography>
					</Grid>
					<Grid item xs={12} className={classes.informationValueContainer}>
						{isLoading ? (
							<Skeleton variant="text" width={30} height={24} />
						) : (
							<Typography className={clsx(classes.informationValue, stakeRatioClasses.fontColor)}>
								{stakeRatioInformation}
							</Typography>
						)}
					</Grid>
				</Grid>
				<Grid container item xs={6}>
					<Grid item xs={12}>
						<Typography variant="subtitle2" color="textSecondary">
							Multiplier:
						</Typography>
					</Grid>
					<Grid item xs={12} className={classes.informationValueContainer}>
						{isLoading ? (
							<Skeleton variant="text" width={30} height={24} />
						) : (
							<Typography className={clsx(classes.informationValue, multiplierClasses.fontColor)}>
								{multiplierInformation}
							</Typography>
						)}
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};
