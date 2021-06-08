import { styled } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

export const BorderedText = styled(Typography)(({ theme }) => ({
	display: 'inline-block',
	boxSizing: 'border-box',
	padding: theme.spacing(1),
	border: '1px solid #5B5B5A',
	borderRadius: 8,
	textAlign: 'center',
}));
