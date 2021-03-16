import React from 'react';
import {
	Box,
	Button,
	Container,
	Grid,
	makeStyles,
	Paper,
	Typography,
	useMediaQuery,
	useTheme,
} from '@material-ui/core';
import Hero from 'components/Common/Hero';
import NFT from './NFT';

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: theme.spacing(11),
		marginBottom: theme.spacing(10),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(33),
			marginTop: theme.spacing(2),
		},
	},
	headerContainer: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
	},
	center: {
		margin: 'auto',
	},
	centerText: {
		textAlign: 'center',
	},
	mainPapers: {
		padding: theme.spacing(2),
	},
	redeemButton: {
		color: theme.palette.common.black,
	},
	nftContainer: {
		[theme.breakpoints.only('xs')]: {
			margin: theme.spacing(2, 'auto'),
		},
	},
	holdingsTitle: {
		marginTop: theme.spacing(4),
		marginBottom: theme.spacing(2),
		[theme.breakpoints.down('sm')]: {
			textAlign: 'center',
		},
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(4),
		},
	},
}));

export const HoneybadgerDrop: React.FC = () => {
	const classes = useStyles();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.only('xs'));

	return (
		<Container className={classes.root}>
			<Grid container spacing={1} justify="center">
				<Grid item xs={12} className={classes.headerContainer}>
					<Hero title="HONEY BADGER DROP" subtitle="MEME Honey Pot 2 - Diamond Hands" />
				</Grid>
				<Grid item xs={12} container spacing={5}>
					<Grid item container justify="center" xs={12} className={classes.centerText}>
						<Grid item xs={12} sm={8} md={7}>
							<Paper elevation={0} className={classes.mainPapers}>
								<Grid container spacing={1}>
									<Grid item xs={12}>
										<Typography>Remaining Honey Pot Pool</Typography>
									</Grid>
									<Grid item xs={12}>
										<Typography variant="h5" color="textPrimary">
											8.5 bDIGG
										</Typography>
									</Grid>
									<Grid item xs={12}>
										<Typography variant="subtitle1" color="textSecondary">
											9.95 DIGG / 7.3 BTC
										</Typography>
									</Grid>
									<Grid item xs={12}>
										<Typography variant="subtitle1" color="textSecondary">
											$354,985.09
										</Typography>
									</Grid>
								</Grid>
							</Paper>
						</Grid>
					</Grid>
					<Grid item container justify="center" xs={12} className={classes.centerText}>
						<Grid item xs={12} sm={8} md={5}>
							<Paper elevation={0} className={classes.mainPapers}>
								<Grid container spacing={1}>
									<Grid item xs={12}>
										<Typography>Available Rewards</Typography>
									</Grid>
									<Grid item container spacing={1} xs={12}>
										<Grid item xs container>
											<Grid item xs={12}>
												<Typography variant="h5" color="textPrimary">
													5
												</Typography>
											</Grid>
											<Grid item xs={12}>
												<Typography variant="subtitle1" color="textSecondary">
													NFTs Held
												</Typography>
											</Grid>
										</Grid>
										<Grid item xs container>
											<Grid item xs={12}>
												<Typography variant="h5" color="textPrimary">
													$5,572
												</Typography>
											</Grid>
											<Grid item xs={12}>
												<Typography variant="subtitle1" color="textSecondary">
													Next Redemption Rate
												</Typography>
											</Grid>
										</Grid>
										<Grid item xs={12}>
											<Button
												className={classes.redeemButton}
												variant="contained"
												color="primary"
											>
												Redeem All
											</Button>
										</Grid>
									</Grid>
								</Grid>
							</Paper>
						</Grid>
					</Grid>
					<Grid item container justify="center" xs={12}>
						<Grid item container xs={12} className={classes.holdingsTitle}>
							<Typography style={{ width: '100%' }}>Your Holdings</Typography>
						</Grid>
						<Grid item container xs={12} justify="space-between" spacing={isMobile ? 0 : 8}>
							<Grid className={classes.nftContainer} item xs={12} sm={6} lg={4}>
								<NFT
									name="DIGG NFT 1"
									balance="Your Balance"
									remaining="426/500"
									redemptionRate="$572.05"
								/>
							</Grid>
							<Grid className={classes.nftContainer} item xs={12} sm={6} lg={4}>
								<NFT
									name="DIGG NFT 2"
									balance="Your Balance"
									remaining="426/500"
									redemptionRate="$572.05"
								/>
							</Grid>
							<Grid className={classes.nftContainer} item xs={12} sm={6} lg={4}>
								<NFT
									name="DIGG NFT 3"
									balance="Your Balance"
									remaining="426/500"
									redemptionRate="$572.05"
								/>
							</Grid>
							<Grid className={classes.nftContainer} item xs={12} sm={6} lg={4}>
								<NFT
									name="DIGG NFT 3"
									balance="Your Balance"
									remaining="426/500"
									redemptionRate="$572.05"
								/>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Container>
	);
};

export default HoneybadgerDrop;
