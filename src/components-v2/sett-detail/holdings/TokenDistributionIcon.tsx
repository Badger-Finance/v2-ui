import React from 'react';
import { makeStyles, Tooltip } from '@material-ui/core';
import { TokenDistribution } from './TokenDistribution';
import HelpIcon from '@material-ui/icons/Help';
import { SettBalance } from '../../../mobx/model/setts/sett-balance';

const useStyles = makeStyles((theme) => ({
	helpIcon: {
		fontSize: 16,
		marginLeft: theme.spacing(0.5),
		color: 'rgba(255, 255, 255, 0.3)',
	},
}));

interface Props {
	settBalance: SettBalance;
}

export const TokenDistributionIcon = ({ settBalance }: Props): JSX.Element | null => {
	const classes = useStyles();

	if (settBalance.tokens.length === 0) {
		return null;
	}

	return (
		<Tooltip enterTouchDelay={0} arrow placement="top" title={<TokenDistribution settBalance={settBalance} />}>
			<HelpIcon className={classes.helpIcon} />
		</Tooltip>
	);
};
