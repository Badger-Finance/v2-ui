import {
	Box,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Link,
	Tooltip,
	Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import BugReportIcon from '@material-ui/icons/BugReport';
import CloseIcon from '@material-ui/icons/Close';
import copy from 'copy-to-clipboard';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';

import { TOOLTIP_LEAVE_TOUCH_DELAY } from '../../../config/constants';
import CopyToClipboardIcon from '../CopyToClipboardIcon';

interface Props {
	open: boolean;
	onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
	title: {
		paddingBottom: 8,
	},
	content: {
		paddingTop: 0,
	},
	logo: {
		width: 250,
		display: 'block',
		margin: '0 auto',
	},
	bugIcon: {
		marginLeft: theme.spacing(0.5),
	},
	closeButton: {
		position: 'absolute',
		top: theme.spacing(1),
		right: theme.spacing(2),
	},
	code: {
		color: '#b7b9bc',
		pageBreakInside: 'avoid',
		fontFamily: 'monospace',
		fontSize: '15px',
		display: 'flex',
		padding: 4,
		wordWrap: 'break-word',
		alignItems: 'center',
	},
	copyToClipboardButton: {
		marginLeft: theme.spacing(0.5),
		color: theme.palette.common.white,
	},
	copyToClipboardIcon: {
		width: '1em',
		height: '1em',
	},
}));

const InvalidCycleDialog = ({ open, onClose }: Props): JSX.Element => {
	const {
		tree,
	} = useContext(StoreContext);
	const [showCopiedText, setShowCopiedText] = useState(false);
	const classes = useStyles();

	const copyToClipboard = () => {
		if (!tree.cycle) return;
		const didCopy = copy(tree.cycle.toString());
		setShowCopiedText(didCopy);
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
			<DialogTitle className={classes.title}>
				<Box display="flex" alignItems="center">
					Invalid Cycle Detected <BugReportIcon className={classes.bugIcon} />
					<IconButton aria-label="close dialog" className={classes.closeButton} onClick={onClose}>
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>
			<DialogContent className={classes.content}>
				<img className={classes.logo} src="/assets/icons/badger-error.png" alt="badger error logo" />
				<DialogContentText id="alert-dialog-description" color="textPrimary">
					The rewards could not be claimed because the current cycle is invalid. Please report this in the ❓
					<Link
						target="_blank"
						href="https://discord.com/channels/743271185751474307/767912941106233355"
						rel="noopener"
					>
						support channel.
					</Link>
				</DialogContentText>
				{tree.cycle && (
					<pre className={classes.code}>
						<Typography color="textPrimary">Cycle: {tree.cycle}</Typography>
						<Tooltip title={showCopiedText ? 'Copied!' : 'Copy to clipboard'} placement="right-start" arrow>
							<IconButton
								onClick={copyToClipboard}
								className={classes.copyToClipboardButton}
								aria-label="copy to clipboard"
								onMouseEnter={() => setShowCopiedText(false)}
								onMouseLeave={() => {
									setTimeout(() => {
										setShowCopiedText(false);
									}, TOOLTIP_LEAVE_TOUCH_DELAY);
								}}
							>
								<CopyToClipboardIcon className={classes.copyToClipboardIcon} />
							</IconButton>
						</Tooltip>
					</pre>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default observer(InvalidCycleDialog);
