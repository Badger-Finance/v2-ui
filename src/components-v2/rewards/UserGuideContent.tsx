import React from 'react';
import {
	Box,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	Typography,
	useMediaQuery,
	useTheme,
} from '@material-ui/core';
import { ArrowBackIosOutlined } from '@material-ui/icons';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		title: {
			padding: '33px 43px 10px 43px',
			[theme.breakpoints.down('xs')]: {
				padding: '24px 33px 10px 33px',
			},
		},
		content: {
			padding: '0px 43px 48px 43px',
			[theme.breakpoints.down('xs')]: {
				padding: '0px 33px 37px 33px',
			},
		},
		arrowBack: {
			position: 'absolute',
			left: 4,
			padding: 10,
			fontSize: 18,
			[theme.breakpoints.down('xs')]: {
				left: 0,
			},
		},
		userGuideTokens: {
			marginTop: theme.spacing(1),
		},
		userGuideToken: {
			backgroundColor: '#181818',
			padding: '21px 22px',
			borderRadius: 10,
			width: 219,
			height: 144,
		},
		rewardsOptions: {
			paddingInlineStart: theme.spacing(2),
			'& li:not(:last-child)': {
				marginBottom: theme.spacing(1),
			},
		},
		boldWeight: {
			fontWeight: 700,
		},
		tokenName: {
			marginBottom: theme.spacing(1),
		},
		tokensSection: {
			marginTop: theme.spacing(2),
		},
	}),
);

interface Props {
	onGoBack: () => void;
}

const UserGuideContent = ({ onGoBack }: Props): JSX.Element => {
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('xs'));

	return (
		<>
			<DialogTitle className={classes.title} disableTypography>
				<Box display="flex" alignItems="center">
					<IconButton aria-label="exit guide mode" className={classes.arrowBack} onClick={onGoBack}>
						<ArrowBackIosOutlined fontSize="inherit" />
					</IconButton>
					<Typography variant="h6" className={classes.boldWeight}>
						Rewards User Guide
					</Typography>
				</Box>
			</DialogTitle>
			<DialogContent className={classes.content}>
				<Grid container>
					<Grid item>
						<ul className={classes.rewardsOptions}>
							<li>
								<Typography variant="body2">Staking 50% non native tokens</Typography>
							</li>
							<li>
								<Typography variant="body2">Holding and/or Staking 50% BadgerDAO tokens</Typography>
							</li>
						</ul>
					</Grid>
					<Grid item container direction="column" xs={12} className={classes.tokensSection}>
						<Grid item>
							<Typography variant="subtitle2">Badger has 3 types of tokens:</Typography>
						</Grid>
						{/*TODO: add link to view vaults when they're available*/}
						<Grid container spacing={isMobile ? 2 : 4} className={classes.userGuideTokens}>
							<Grid item>
								<div className={classes.userGuideToken}>
									<Typography className={classes.tokenName} variant="body2" color="textSecondary">
										BADGERDAO TOKENS:
									</Typography>
									<Typography variant="subtitle2">Badger, Digg</Typography>
									{/*<Box display="flex" alignItems="center">*/}
									{/*	<ArrowRightAltIcon color="primary" />*/}
									{/*	<Link className={classes.cursorPointer}>View Vaults</Link>*/}
									{/*</Box>*/}
								</div>
							</Grid>
							<Grid item>
								<div className={classes.userGuideToken}>
									<Typography className={classes.tokenName} variant="body2" color="textSecondary">
										BOOSTED TOKENS:
									</Typography>
									<Typography variant="subtitle2">
										ibBTC, crvsBTC LP, imBTC, Mhbtc, Cvxcrv, Tricrypto
									</Typography>
									{/*<Box display="flex" alignItems="center">*/}
									{/*	<ArrowRightAltIcon color="primary" />*/}
									{/*	<Link className={classes.cursorPointer}>View Vaults</Link>*/}
									{/*</Box>*/}
								</div>
							</Grid>
							<Grid item>
								<div className={classes.userGuideToken}>
									<Typography className={classes.tokenName} variant="body2" color="textSecondary">
										NON-BOOSTED TOKENS:
									</Typography>
									<Typography variant="subtitle2">All other tokens (e.g. wBTC, renBTC...)</Typography>
									{/*<Box display="flex" alignItems="center">*/}
									{/*	<ArrowRightAltIcon color="primary" />*/}
									{/*	<Link className={classes.cursorPointer}>View Vaults</Link>*/}
									{/*</Box>*/}
								</div>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</DialogContent>
		</>
	);
};

export default UserGuideContent;
