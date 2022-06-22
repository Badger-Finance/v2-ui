import { Currency } from '@badger-dao/sdk';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';

import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import CurrencyDisplay from '../common/CurrencyDisplay';

export interface RewardsModalItemProps {
  checked: boolean;
  claimBalance: TokenBalance;
  onChange: (checked: boolean) => void;
}

const useStyles = makeStyles(() => ({
  currencyContainer: {
    width: '100%',
    textAlign: 'end',
  },
  boldWeight: {
    fontWeight: 700,
  },
}));

export const RewardsModalItem = observer(
  (props: RewardsModalItemProps): JSX.Element => {
    const classes = useStyles();
    const { claimBalance, onChange, checked } = props;

    return (
      <Grid
        key={`${claimBalance.token.address}-claim-amount`}
        container
        direction="row"
        justifyContent="space-between"
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={(event) => onChange(event.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">{claimBalance.token.symbol}</Typography>
          }
        />
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h6" className={classes.boldWeight}>
            {claimBalance.balanceDisplay(5)}
          </Typography>
          <div className={classes.currencyContainer}>
            <CurrencyDisplay
              variant="body2"
              justifyContent="flex-end"
              displayValue={claimBalance.balanceValueDisplay(5)}
              TypographyProps={{ color: 'textSecondary' }}
            />
          </div>
        </Box>
      </Grid>
    );
  },
);
