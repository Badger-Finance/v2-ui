import React, { useContext } from 'react';
import { Box, Grid, Link, Paper, Typography } from '@material-ui/core';
import { LayoutContainer } from './Containers';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Warning } from '@material-ui/icons';
import { EXPLOIT_HACKER_ADDRESS } from '../../config/constants';

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: theme.spacing(3),
		padding: theme.spacing(3),
	},
	warningIcon: {
		marginRight: theme.spacing(1),
	},
	list: {
		wordBreak: 'break-word',
	},
}));

const ApprovalVulnerabilitiesWarning = (): JSX.Element | null => {
	const { onboard, user } = useContext(StoreContext);

	const classes = useStyles();

	if (!user.approvalVulnerabilities || user.approvalVulnerabilities.length === 0) {
		return null;
	}

	const vulnerabilities = user.approvalVulnerabilities.map((vulnerability) => {
		const asset = user.getTokenBalance(vulnerability.token.id);

		return (
			<li key={vulnerability.transactionId}>
				<Typography variant="body1">
					{asset.token.symbol}:{' '}
					<Link
						target="_blank"
						rel="noreferrer"
						href={`https://etherscan.io/tx/${vulnerability.transactionId}`}
					>
						See on Etherscan
					</Link>
				</Typography>
			</li>
		);
	});

	return (
		<LayoutContainer>
			<Grid container component={Paper} className={classes.root} direction="column">
				<Box display="flex" alignItems="center" marginBottom={2}>
					<Warning className={classes.warningIcon} />
					<Typography variant="h4">SECURITY WARNING</Typography>
				</Box>
				<Typography variant="subtitle1">
					{
						"We've detected that your wallet address signed a token approve request from the attacker for the following assets:"
					}
				</Typography>
				<ul className={classes.list}>{vulnerabilities}</ul>
				<Typography variant="subtitle1">
					As a precautionary measure, we recommend you take the following actions:
				</Typography>
				<ol className={classes.list}>
					<li>
						<Typography variant="body1">
							Check all token approvals here:{' '}
							<Link
								target="_blank"
								rel="noreferrer"
								href={`https://debank.com/profile/${onboard.address}/approve`}
							>
								{`https://debank.com/profile/${onboard.address}/approve`}
							</Link>{' '}
						</Typography>
					</li>
					<li>
						<Typography variant="body1">
							{`Search for the hacker's address: ${EXPLOIT_HACKER_ADDRESS}`}
						</Typography>
					</li>
					<li>
						<Typography variant="subtitle1">Revoke Address</Typography>
					</li>
					<li>
						<Typography variant="subtitle1">
							Search your permissions and revoke any other unrecognized token approval
						</Typography>
					</li>
				</ol>
			</Grid>
		</LayoutContainer>
	);
};

export default observer(ApprovalVulnerabilitiesWarning);
