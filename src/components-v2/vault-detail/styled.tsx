import { Card, Divider } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';

export const StyledDivider = styled(Divider)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
}));

export const CardContainer = styled(Card)({
  height: '100%',
});
