import React from 'react';
import { Grid } from '@material-ui/core';
import PageHeader from '../components-v2/common/PageHeader';
import { observer } from 'mobx-react-lite';
import { PageHeaderContainer, LayoutContainer } from '../components-v2/common/Containers';
import VaultListDisplay from '../components-v2/landing/VaultListDisplay';
import VaultsSearchControls from '../components-v2/VaultSearchControls';

interface LandingProps {
	title: string;
	subtitle?: string | React.ReactNode;
}

const Landing = observer((props: LandingProps) => {
	const { title, subtitle } = props;

	return (
		<LayoutContainer>
			<Grid container justifyContent="center">
				<PageHeaderContainer item container xs={12} alignItems="center">
					<Grid item xs={10} md={6}>
						<PageHeader title={title} subtitle={subtitle} />
					</Grid>
				</PageHeaderContainer>
			</Grid>
			<VaultsSearchControls />
			<VaultListDisplay />
		</LayoutContainer>
	);
});

export default Landing;
