/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { Grid, Typography, makeStyles } from '@material-ui/core';

interface Detail {
	name: string;
	text?: string;
	subText?: string;
}
interface Props {
	details: Detail[];
}

const useStyles = makeStyles((theme) => ({
	root: {
		maxWidth: '100%',
	},
	row: {
		marginTop: theme.spacing(1),
	},
	detail: {
		wordBreak: 'break-word',
		textAlign: 'end',
	},
	placeholder: {
		wordBreak: 'break-word',
		textAlign: 'center',
	},
	rightMargin: {
		marginRight: theme.spacing(2),
	},
	leftMargin: {
		marginLeft: theme.spacing(2),
	},
}));

const DetailName = ({ name }: Pick<Detail, 'name'>) => {
	const classes = useStyles();

	return (
		<Grid item xs={6} className={[classes.detail].join(' ')}>
			<Typography variant="body2" color="textSecondary">
				{name}
			</Typography>
		</Grid>
	);
};

const DetailDescription = ({ text, subText }: Pick<Detail, 'text' | 'subText'>) => {
	const classes = useStyles();

	return (
		<Grid item container xs={6} className={[text ? classes.detail : classes.placeholder].join(' ')}>
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
