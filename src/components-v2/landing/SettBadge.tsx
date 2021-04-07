import React from 'react';
import { Chip, makeStyles } from '@material-ui/core';

interface SettBadgeProps {
	settName: string;
}

const useStyles = makeStyles((theme) => ({
	chip: {
		marginLeft: theme.spacing(1),
		padding: 0,
	},
}));

const SettBadge = (props: SettBadgeProps): JSX.Element => {
	const { settName } = props;
	const classes = useStyles();
	switch (settName) {
		case 'Harvest':
			return (
				<Chip
					className={classes.chip}
					label={settName}
					size="small"
					color="primary"
					style={{ backgroundColor: '#eebf65' }}
				/>
			);
		case 'Yearn':
			return (
				<Chip
					className={classes.chip}
					label={settName}
					size="small"
					color="primary"
					style={{ backgroundColor: '#0657f9', color: 'white' }}
				/>
			);
		default:
			return <> </>;
	}
};

export default SettBadge;
