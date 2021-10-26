import { styled } from '@material-ui/core/styles';
import { Container, Grid } from '@material-ui/core';
import { MAX_LAYOUT_WIDTH } from '../../config/constants';

export const LayoutContainer = styled(Container)({
	maxWidth: MAX_LAYOUT_WIDTH,
});

export const HeaderContainer = styled(Grid)(({ theme }) => ({
	marginTop: theme.spacing(3),
	marginBottom: theme.spacing(3),
}));
