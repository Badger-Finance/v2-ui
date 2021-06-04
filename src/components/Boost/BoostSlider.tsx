import React from 'react';
import { observer } from 'mobx-react-lite';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';

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
	active: {},
	rail: {
		color: '#6B6B6B',
		opacity: 1,
		width: '4px !important',
	},
}))(Slider);

function ThumbComponent(props: any) {
	return (
		<div {...props}>
			<div className="bar" />
			<div className="bar" />
			<div className="bar" />
		</div>
	);
}

export const BoostSlider = observer(() => {
	return <CustomSlider orientation="vertical" ThumbComponent={ThumbComponent} min={1} max={100} defaultValue={1} />;
});
