import { styled } from '@material-ui/core/styles';
import { Container, Grid } from '@material-ui/core';

export const LayoutContainer = styled(Container)({
	maxWidth: 1152,
});

export const HeaderContainer = styled(Grid)(({ theme }) => ({
	marginTop: theme.spacing(3),
	marginBottom: theme.spacing(3),
}));
