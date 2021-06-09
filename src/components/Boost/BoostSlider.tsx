import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Slider, { SliderProps } from '@material-ui/core/Slider';

const CustomSlider = withStyles((theme) => ({
	thumb: {
		height: 20,
		width: 20,
		backgroundColor: theme.palette.primary.main,
		border: '1px solid currentColor',
		borderRadius: '2px',
		display: 'flex',
		flexDirection: 'column',
		marginTop: '-10px !important',
		marginLeft: '-8px !important',
		boxShadow: `${theme.palette.primary.contrastText} 0 2px 2px`,
		'&:focus, &:hover, &$active': {
			boxShadow: `${theme.palette.primary.contrastText} 0 2px 3px 1px`,
		},
		'& .bar': {
			height: 2,
			width: 10,
			backgroundColor: 'rgba(169,115,30,0.8)',
			marginTop: 1,
			marginBottom: 1,
		},
	},
	rail: {
		color: '#6B6B6B',
		opacity: 1,
		width: '4px !important',
	},
	track: {
		width: '4px !important',
	},
}))(Slider);

function ThumbComponent(props: React.HTMLProps<HTMLDivElement>) {
	return (
		<div {...props}>
			<div className="bar" />
			<div className="bar" />
			<div className="bar" />
		</div>
	);
}

export const BoostSlider: React.FC<SliderProps> = (props) => {
	return <CustomSlider {...props} orientation="vertical" ThumbComponent={ThumbComponent} />;
};
