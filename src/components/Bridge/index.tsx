import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Grid, Container, Paper } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import { StoreContext } from '../../mobx/store-context';
import { BridgeForm } from './BridgeForm';
import PageHeader from 'components-v2/common/PageHeader';

const useStyles = makeStyles((theme) => ({
	root: {
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(30),
		},
	},
	headerContainer: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(6),
	},
	statPaper: {
		textAlign: 'center',
	},
	before: {
		marginTop: theme.spacing(3),
		width: '100%',
	},
	summaryWrapper: {
		background: 'rgba(20, 20, 20, 0.5)',
		boxShadow: '0px 0.913793px 3.65517px rgba(0, 0, 0, 0.08)',
		margin: '0 0px',
	},
	summaryRow: {
		display: 'flex',
		padding: '1rem 2.4rem',

		justifyContent: 'space-between',
		'& h6:last-child': {
			textAlign: 'end',
		},
		'& h6:first-child': {
			textAlign: 'start',
		},
	},
	button: {
		margin: theme.spacing(2, 0, 3),
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
	tabHeader: { background: 'rgba(0,0,0,.2)' },
	btnMax: {
		alignSelf: 'center',
		marginRight: '.6rem',
	},
	padded: {
		padding: '2rem 2rem',
	},
	select: { height: '3rem', overflow: 'hidden', margin: '.3rem 0 0 .6rem' },
	row: {
		display: 'flex',
		justifyContent: 'space-between',
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		padding: '.5rem 0 0 1rem',
	},
}));
export const Bridge = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const spacer = () => <div className={classes.before} />;

	return (
		<Container className={classes.root}>
			<Grid container spacing={1} justify="center">
				<Grid item sm={12} xs={12} className={classes.headerContainer}>
					<PageHeader title="Badger Bitcoin Bridge." subtitle="Powered by RenVM" />
				</Grid>
				<Grid item xs={12} md={7}>
					<Paper className={classes.statPaper} style={{ padding: '1rem 0' }}>
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
