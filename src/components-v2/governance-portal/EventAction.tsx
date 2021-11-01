import React from 'react';
import { TimelockEvent } from '../../mobx/model/governance-timelock/timelock-event';
import { makeStyles, Tooltip } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	tooltipWrap: {
		cursor: 'help',
		borderBottom: '1px dotted',
		fontFamily: 'monospace',
	},
}));

export interface EventActionProps {
	event: TimelockEvent;
}

const EventAction = ({ event }: EventActionProps): JSX.Element => {
	const classes = useStyles();

	return (
		<>
			{event.functionName}
			<span>(</span>
			{event.parameterTypes.length &&
				event.parameterTypes.map((param, ind) => (
					<span key={'param-' + ind}>
						<Tooltip
							className={classes.tooltipWrap}
							title={
								event.decodedParameters
									? (Object.values(event.decodedParameters)[ind] as string)
									: 'Could not decode'
							}
						>
							<span>{param}</span>
						</Tooltip>
						{event.parameterTypes.length - 1 > ind && ', '}
					</span>
				))}
			<span>)</span>
		</>
	);
};

export default EventAction;
