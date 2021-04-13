/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { Grid, Typography, makeStyles } from '@material-ui/core';
import { ClawActionDetail } from './claw.model';

interface Props {
	details: ClawActionDetail[];
}

const useStyles = makeStyles((theme) => ({
	root: {
		maxWidth: '100%',
	},
	row: {
		marginTop: theme.spacing(1),
	},
	detailName: {
		wordBreak: 'break-word',
		textAlign: 'end',
		'@media (max-width: 480px)': {
			textAlign: 'start',
		},
	},
	detailDescription: {
		wordBreak: 'break-word',
		textAlign: 'end',
	},
	placeholder: {
		wordBreak: 'break-word',
		textAlign: 'center',
	},
}));

const DetailName = ({ name }: Pick<ClawActionDetail, 'name'>) => {
	const classes = useStyles();

	return (
		<Grid item xs={6} className={classes.detailName}>
			<Typography variant="body2" color="textSecondary">
				{name}
			</Typography>
		</Grid>
	);
};

const DetailDescription = ({ text, subText }: Pick<ClawActionDetail, 'text' | 'subText'>) => {
	const classes = useStyles();
	const descriptionClass = text ? classes.detailDescription : classes.placeholder;

	return (
		<Grid item container xs={6} className={descriptionClass}>
			<Grid item xs={12}>
				<Typography variant="body2" color="textPrimary">
					{text || '-'}
				</Typography>
			</Grid>
			{subText && (
				<Grid item xs={12}>
					<Typography variant="caption" color="textSecondary">
						{subText}
					</Typography>
				</Grid>
			)}
		</Grid>
	);
};

export const ClawDetails: FC<Props> = ({ details }) => {
	const classes = useStyles();

	return (
		<Grid container className={classes.root}>
			{details.map(({ name, text, subText }, index) => (
				<Grid container className={classes.row} key={`${name}_${index}`}>
					<DetailName name={name} />
					<DetailDescription text={text} subText={subText} />
				</Grid>
			))}
		</Grid>
	);
};

export default ClawDetails;
