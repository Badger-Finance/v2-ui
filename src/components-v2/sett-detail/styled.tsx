import { styled } from '@material-ui/core/styles';
import { Card, Divider } from '@material-ui/core';

export const StyledDivider = styled(Divider)(({ theme }) => ({
	width: '100%',
	marginBottom: theme.spacing(1),
}));

export const CardContainer = styled(Card)({
	height: '100%',
});
