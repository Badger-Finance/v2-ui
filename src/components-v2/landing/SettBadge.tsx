import React from 'react';
import { Chip, makeStyles } from '@material-ui/core';
import { CSSProperties } from '@material-ui/styles';

interface SettBadgeProps {
	settName: string;
}

const useStyles = makeStyles((theme) => ({
	chip: {
		marginLeft: theme.spacing(1),
		padding: 0,
	},
}));

const SettBadge = (props: SettBadgeProps): JSX.Element | null => {
	const { settName } = props;
	const classes = useStyles();

	let style: CSSProperties | undefined;
	switch (settName) {
		case 'Harvest':
			style = { backgroundColor: '#eebf65' };
			break;
		case 'Yearn':
			style = { backgroundColor: '#0657f9', color: 'white' };
			break;
		case 'Convex':
			style = { backgroundColor: '#459c77', color: 'white' };
			break;
		default:
			return null;
	}
	return <Chip className={classes.chip} label={settName} size="small" color="primary" style={style} />;
};

export default SettBadge;
