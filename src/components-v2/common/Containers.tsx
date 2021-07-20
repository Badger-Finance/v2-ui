import { styled } from '@material-ui/core/styles';
import { Container, Grid } from '@material-ui/core';

export const LayoutContainer = styled(Container)({
	maxWidth: 1024,
	paddingRight: 0,
	paddingLeft: 0,
});

export const HeaderContainer = styled(Grid)(({ theme }) => ({
	marginTop: theme.spacing(3),
	marginBottom: theme.spacing(3),
}));
