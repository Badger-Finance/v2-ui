import React from 'react';
import { Grid, makeStyles, Paper, Typography, Link, List } from '@material-ui/core';
import { LayoutContainer, PageHeaderContainer } from '../../components-v2/common/Containers';

import PageHeader from 'components-v2/common/PageHeader';

const useStyles = makeStyles((theme) => ({
	guideContainer: {
		display: 'flex',
		justifyContent: 'center',
		[theme.breakpoints.down('sm')]: {
			textAlign: 'center',
		},
		padding: theme.spacing(2),
	},
	bridgeInfo: {
		paddingBottom: theme.spacing(4),
	},
	bridgeLink: {
		fontWeight: 800,
		[theme.breakpoints.down('xs')]: {
			display: 'none',
		},
	},
	bridgeDescription: {
		marginBottom: theme.spacing(2),
	},
}));

const BridgeList = () => {
	const classes = useStyles();
	return (
		<LayoutContainer style={{ width: '100vw' }}>
			<Grid container spacing={1} justifyContent="center">
				<PageHeaderContainer item sm={12} xs={12}>
					<PageHeader title="Bridges" subtitle="Move BTC Between Chains" />
				</PageHeaderContainer>
				<Typography className={classes.bridgeInfo}>
					The Badger Bridge is under maintenance. You can use the below bridges to move BTC to and from EVM
					chains.
				</Typography>
				<Grid item xs={8}>
					<Paper className={classes.guideContainer}>
						<List>
							<Grid container spacing={1}>
								<Grid item xs={3} md={2}>
									<Link
										target="_blank"
										rel="noopener noreferrer"
										href="https://bridge.zerodao.com/"
										color="primary"
										className={classes.bridgeLink}
									>
										zeroBRIDGE
									</Link>
								</Grid>
								<Grid item xs={9} md={10} className={classes.bridgeDescription}>
									Crosschain exchange built on top of renVM and zeroP2P enabling gasless bridging to
									and from many other assets. More information available at{' '}
									<Link
										target="_blank"
										rel="noopener noreferrer"
										href="https://zerodao.com/"
										color="primary"
										className={classes.bridgeLink}
									>
										zerodao.com
									</Link>
								</Grid>
							</Grid>

							<Grid container spacing={1}>
								<Grid item xs={3} md={2}>
									<Link
										target="_blank"
										rel="noopener noreferrer"
										href=" https://bridge.renproject.io/"
										color="primary"
										className={classes.bridgeLink}
									>
										Ren Bridge
									</Link>
								</Grid>
								<Grid item xs={9} md={10}>
									Ren Bridge is a simple bridge for moving renBTC to and from the BTC blockchain.
								</Grid>
							</Grid>
						</List>
					</Paper>
				</Grid>
			</Grid>
		</LayoutContainer>
	);
};

export default BridgeList;
