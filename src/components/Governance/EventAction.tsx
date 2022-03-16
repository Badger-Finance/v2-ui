import { TimelockEvent } from '../../mobx/model/governance-timelock/timelock-event';
import { makeStyles, Tooltip } from '@material-ui/core';

const useStyles = makeStyles(() => ({
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

	const getTooltipContent = (event: TimelockEvent, ind: number) => {
		return event.decodedParameters ? (Object.values(event.decodedParameters)[ind] as string) : 'Could not decode';
	};

	if (!event.parameterTypes) {
		return <>event.functionName</>;
	} else {
		return (
			<>
				{event.functionName}
				<span>(</span>
				{event.parameterTypes &&
					event.parameterTypes.length > 0 &&
					event.parameterTypes.map((param, ind) => (
						<span key={'param-' + ind}>
							<Tooltip className={classes.tooltipWrap} title={getTooltipContent(event, ind)}>
								<span>{param}</span>
							</Tooltip>
							{event.parameterTypes && event.parameterTypes.length - 1 > ind && ', '}
						</span>
					))}
				<span>)</span>
			</>
		);
	}
};

export default EventAction;
