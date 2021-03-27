import { Button, Container, Grid, Typography } from '@material-ui/core';

import BugReportIcon from '@material-ui/icons/BugReport';
import ForumIcon from '@material-ui/icons/Forum';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
	link: {
		display: 'flex',
		padding: '.5rem .5rem .25rem 0',
		cursor: 'pointer',
		transition: 'transform .1s ease-in-out',
		transform: 'scale(1)',
		transformOrigin: 'left center',

		'&:hover': {
			transform: 'scale(1.1)',
		},
		// marginLeft: "-.8rem"
	},
	icon: {
		marginRight: '12px',
		height: '20px',
		marginBottom: '-.2rem',
	},
	iconContainer: {
		width: '2rem',
	},
}));

export const Footer = (): JSX.Element => {
	const classes = useStyles();

	return (
		<div style={{ margin: '6rem 0 0', background: '#fff', width: '100%' }}>
			<Container style={{ padding: '8rem 1rem 5rem' }}>
				<Grid container spacing={4}>
					<Grid item sm={12} lg={3} style={{ margin: '.5rem 0' }}>
						<img
							alt="Score Logo"
							src={'assets/8bit/badger score.png'}
							height="80px"
							style={{ marginBottom: '1rem' }}
						/>
						<br />
						<Button
							aria-label="Get Coverage"
							variant="outlined"
							color="secondary"
							href="https://app.coverprotocol.com/app/marketplace/protocols/BADGERDAO"
							target="_"
						>
							Get Coverage
						</Button>
					</Grid>
					<Grid item xs={12} sm={4} lg={3}>
						<Typography variant="h6" style={{ marginBottom: '.5rem' }}>
							Badger finance
						</Typography>

						<div
							className={classes.link}
							onClick={() => window.open('https://www.twitter.com/badgerdao', '_blank')}
						>
							<div className={classes.iconContainer}>
								<img
									alt="Twitter Logo"
									src={'assets/twitter.svg'}
									height="24px"
									className={classes.icon}
								/>
							</div>
							<Typography variant="body1">Twitter</Typography>
						</div>
						<div
							className={classes.link}
							onClick={() => window.open('https://badgerdao.medium.com', '_blank')}
						>
							<div className={classes.iconContainer}>
								<img
									alt="Medium Logo"
									src={'assets/medium.svg'}
									height="24px"
									className={classes.icon}
								/>
							</div>
							<Typography variant="body1">Medium</Typography>
						</div>
						<div className={classes.link} onClick={() => window.open('https://t.me/badger_dao', '_blank')}>
							<div className={classes.iconContainer}>
								<img
									alt="Telegram Logo"
									src={'assets/telegram.svg'}
									height="24px"
									className={classes.icon}
								/>
							</div>
							<Typography variant="body1">Telegram</Typography>
						</div>
					</Grid>
					<Grid item xs={12} sm={4} lg={3}>
						<Typography variant="h6" style={{ marginBottom: '.5rem' }}>
							Community
						</Typography>
						<div
							className={classes.link}
							onClick={() => window.open('https://discord.com/invite/xSPFHHS', '_blank')}
						>
							<div className={classes.iconContainer}>
								<img
									alt="Discord Logo"
									src={'assets/discord.svg'}
									height="24px"
									className={classes.icon}
								/>
							</div>
							<Typography variant="body1">Discord</Typography>
						</div>
						<div
							className={classes.link}
							onClick={() => window.open('https://github.com/Badger-Finance', '_blank')}
						>
							<div className={classes.iconContainer}>
								<img
									alt="Github Logo"
									src={'assets/github.svg'}
									height="24px"
									className={classes.icon}
								/>
							</div>
							<Typography variant="body1">Github</Typography>
						</div>
						<div
							className={classes.link}
							onClick={() =>
								window.open('https://app.gitbook.com/@badger-finance/s/badger-finance/', '_blank')
							}
						>
							<div className={classes.iconContainer}>
								<img
									alt="Gitbook Logo"
									src={'assets/github.svg'}
									height="24px"
									className={classes.icon}
								/>
							</div>
							<Typography variant="body1">Docs</Typography>
						</div>
						<div
							className={classes.link}
							onClick={() => window.open('https://forum.badger.finance/', '_blank')}
						>
							<div className={classes.iconContainer}>
								<ForumIcon height="24px" className={classes.icon} />
							</div>
							<Typography variant="body1">Forum</Typography>
						</div>
					</Grid>
					<Grid item xs={12} sm={4} lg={3}>
						<Typography variant="h6" style={{ marginBottom: '.5rem' }}>
							Ecosystem
						</Typography>
						<div
							className={classes.link}
							onClick={() =>
								window.open(
									'https://badgerdao.medium.com/badger-developer-program-3bf0cb2cc5f1',
									'_blank',
								)
							}
						>
							<div className={classes.iconContainer}>
								<HowToVoteIcon height="24px" className={classes.icon} />
							</div>
							<Typography variant="body1">Badger Developer Program</Typography>
						</div>
						<div
							className={classes.link}
							onClick={() =>
								window.open(
									'https://www.linkedin.com/posts/zokyo_badgerfinance-smart-contract-audit-report-activity-6743215337971429376-j3fK',
									'_blank',
								)
							}
						>
							<div className={classes.iconContainer}>
								<BugReportIcon height="24px" className={classes.icon} />
							</div>
							<Typography variant="body1">Zokyo Audit</Typography>
						</div>
					</Grid>
				</Grid>
			</Container>
		</div>
	);
};
