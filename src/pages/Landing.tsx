import React from 'react';
import { observer } from 'mobx-react-lite';
import { LayoutContainer } from '../components-v2/common/Containers';
import VaultListDisplay from '../components-v2/landing/VaultListDisplay';
import VaultsSearchControls from '../components-v2/VaultSearchControls';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
	root: {
		marginTop: 48,
	},
});

const Landing = observer(() => {
	const classes = useStyles();
	return (
		<LayoutContainer className={classes.root}>
			<VaultsSearchControls />
			<VaultListDisplay />
		</LayoutContainer>
	);
});

export default Landing;
