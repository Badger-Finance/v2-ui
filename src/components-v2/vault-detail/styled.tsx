import { styled } from '@material-ui/core/styles';
import { Card, Divider } from '@material-ui/core';
import HelpIcon from '@material-ui/icons/Help';

export const StyledDivider = styled(Divider)(({ theme }) => ({
	width: '100%',
	marginTop: theme.spacing(0.5),
	marginBottom: theme.spacing(1),
}));

export const CardContainer = styled(Card)({
	height: '100%',
});

export const StyledHelpIcon = styled(HelpIcon)(() => ({
	fontSize: 14,
	marginLeft: 5,
	cursor: 'pointer',
	color: 'rgba(255, 255, 255, 0.3)',
}));
