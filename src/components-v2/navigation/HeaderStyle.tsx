import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	appBar: {
		justifyContent: 'space-between',
		[theme.breakpoints.up('md')]: {
			display: 'none',
		},
	},
	toolbar: {
		justifyContent: 'space-between',
		cursor: 'pointer',
	},
	logo: {
		height: '2.4rem',
	},
	menuButton: {
		float: 'right',
		color: '#000',
	},
}));

export { useStyles };
