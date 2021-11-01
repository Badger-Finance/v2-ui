import React from 'react';
import { Paper, Typography, makeStyles, Box, Link, Grid } from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { observer } from 'mobx-react-lite';

export interface AddressInfoCardProps {
	title: string;
	address?: string;
}

const useStyles = makeStyles((theme) => ({
	infoPaper: {
		padding: theme.spacing(2),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
	linkIcon: {
		display: 'inline-block',
		transform: 'translateY(3px)',
	},
}));

const AddressInfoCard: React.FC<AddressInfoCardProps> = observer((props: AddressInfoCardProps) => {
	const classes = useStyles();
	const { title, address } = props;
	return (
		<Paper elevation={2} className={classes.infoPaper}>
			<Typography variant="subtitle1" color="textPrimary">
				{title}
			</Typography>

			<Grid container justify="center">
				<Grid item xs={9}>
					<Box width="100%">
						<Typography variant="h5" noWrap>
							{address}
						</Typography>
					</Box>
				</Grid>
				<Grid item xs="auto">
					<Link className={classes.linkIcon} href={'https://etherscan.io/address/' + address} target="_blank">
						<ExitToAppIcon />
					</Link>
				</Grid>
			</Grid>
		</Paper>
	);
});

export default AddressInfoCard;
