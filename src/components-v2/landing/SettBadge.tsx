import React from 'react';
import { Chip, makeStyles } from '@material-ui/core';
import { CSSProperties } from '@material-ui/styles';
import { Protocol } from 'mobx/model/system-config/protocol';

interface SettBadgeProps {
	protocol: string;
}

const useStyles = makeStyles((theme) => ({
	chip: {
		marginLeft: theme.spacing(1),
		padding: 0,
	},
}));

const SettBadge = (props: SettBadgeProps): JSX.Element | null => {
	const { protocol } = props;
	const classes = useStyles();
	const evaluatedProtocol = Protocol[protocol as keyof typeof Protocol];

	let style: CSSProperties | undefined;
	switch (evaluatedProtocol) {
		case Protocol.Harvest:
			style = { backgroundColor: '#eebf65' };
			break;
		case Protocol.Yearn:
			style = { backgroundColor: '#0657f9', color: 'white' };
			break;
		case Protocol.Convex:
			style = { backgroundColor: '#459c77', color: 'white' };
			break;
		case Protocol.Curve:
			style = { backgroundColor: '#ece210' };
			break;
		case Protocol.Sushiswap:
			style = { backgroundColor: '#d268af', color: 'white' };
			break;
		case Protocol.Quickswap:
			style = { backgroundColor: '#478bca', color: 'white' };
			break;
		case Protocol.Obsolete:
			style = { backgroundColor: 'rgb(183, 63, 63)', color: 'white' };
			break;
		default:
			return null;
	}
	return <Chip className={classes.chip} label={protocol} size="small" color="primary" style={style} />;
};

export default SettBadge;
