import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Grid, Container, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from '../../mobx/store-context';
import { BridgeForm } from './BridgeForm';
import PageHeader from 'components-v2/common/PageHeader';

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: theme.spacing(11),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(33),
			marginTop: theme.spacing(2),
		},
	},
	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center',
	},
	before: {
		marginTop: theme.spacing(3),
		width: '100%',
	},
	button: {
		margin: theme.spacing(1.5, 0, 2),
		paddingTop: theme.spacing(2),
		paddingBottom: theme.spacing(2),
		width: '70%',
	},
	amountInput: {
		width: '100%',
		fontSize: '52px',
		textAlign: 'center',
		border: '0px solid transparent',
		outline: 'none',
		color: theme.palette.text.primary,
		backgroundColor: theme.palette.background.paper,
	},
	itemContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingLeft: theme.spacing(4),
		paddingRight: theme.spacing(4),
		paddingBottom: theme.spacing(1),
	},
	info: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingRight: theme.spacing(10),
	},
	checkboxContainer: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		textAlign: 'left',
		paddingLeft: theme.spacing(4),
		paddingRight: theme.spacing(4),
		paddingBottom: theme.spacing(1),
	},
	itemLabel: {
		fontSize: '16px',
		paddingTop: theme.spacing(1),
		paddingBottom: theme.spacing(1),
		paddingLeft: theme.spacing(8),
		textAlign: 'left',
	},
	receiveAmount: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	logo: {
		height: '1.8rem',
		width: 'auto',
		paddingRight: theme.spacing(1),
		paddingLeft: theme.spacing(1),
	},
	logo2: {
		height: '1.6rem',
		width: 'auto',
		paddingRight: theme.spacing(2),
	},
	menuItem: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		fontSize: 18,
	},
	link: {
		color: 'white',
	},
	btcInput: {
		fontSize: '14px',
		paddingTop: theme.spacing(1),
		paddingBottom: theme.spacing(1),
		borderRadius: 4,
		color: theme.palette.text.primary,
		backgroundColor: theme.palette.background.paper,
	},
}));
export const Bridge = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const spacer = () => <div className={classes.before} />;

	return (
		<Container className={classes.root}>
			<Grid container spacing={2} justify="center">
				<Grid item sm={12} xs={12}>
					<PageHeader title="Badger Bitcoin Bridge." subtitle="Powered by RenVM" />
				</Grid>
				{spacer()}
				<Grid item xs={12} md={7}>
					<Paper className={classes.statPaper}>
						<p>
							RenVM is new technology and{' '}
							<a
								className={classes.link}
								href={'https://github.com/renproject/ren/wiki/Audits'}
								target={'_blank'}
							>
								security audits
							</a>{' '}
							don't completely eliminate risks.
							<br />
							Please don’t supply assets you can’t afford to lose.
						</p>
					</Paper>
				</Grid>
				{spacer()}
				<Grid item xs={12} md={7}>
					<Paper className={classes.statPaper}>
						<BridgeForm classes={classes} />
					</Paper>
				</Grid>
			</Grid>
		</Container>
	);
});
