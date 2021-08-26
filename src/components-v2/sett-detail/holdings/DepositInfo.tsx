import { Link, makeStyles, Typography } from '@material-ui/core';
import { StrategyConfig } from 'mobx/model/strategies/strategy-config';
import React from 'react';

const useStyles = makeStyles((theme) => ({
	description: {
		marginTop: theme.spacing(1),
	},
	depositLink: {
		textDecoration: 'underline',
		paddingLeft: theme.spacing(0.75),
		paddingRight: theme.spacing(0.75),
		marginTop: 'auto',
		marginBottom: '0.5px',
	},
	depositMessage: {
		display: 'flex',
	},
}));

interface Props {
	strategy: StrategyConfig;
}

const DepositInfo: React.FC<Props> = ({ strategy }: Props) => {
	const classes = useStyles();

	if (!strategy.depositLink) {
		return null;
	}

	return (
		<div className={classes.depositMessage}>
			<Typography variant="body2" className={classes.description}>
				Follow this sett&apos;s
			</Typography>
			<Link className={classes.depositLink} target="_blank" rel="noreferrer" href={strategy.depositLink}>
				user guide
			</Link>
			<Typography variant="body2" className={classes.description}>
				to get started.
			</Typography>
		</div>
	);
};

export default DepositInfo;
