import { styled } from '@material-ui/core/styles';
import { Container, Grid } from '@material-ui/core';
import { MAX_LAYOUT_WIDTH } from '../../config/constants';

export const LayoutContainer = styled(Container)({
	maxWidth: MAX_LAYOUT_WIDTH,
});

export const PageHeaderContainer = styled(Grid)({
	marginTop: 42,
	marginBottom: 42,
});
