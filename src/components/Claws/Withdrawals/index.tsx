import React, { FC } from 'react';
import {
	Box,
	Button,
	Chip,
  Grid,
  Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@material-ui/core';
import { InfoOutlined as InfoOutlinedIcon, UnfoldMoreTwoTone } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

export const useMainStyles = makeStyles((theme) => ({
	table: {
    minWidth: 650,
  },
  tableRow: {
    '&:last-child td, &:last-child th': {
      border: 0,
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
    },
  },
  tableRowSubdued: {
    '& .MuiTableCell-head': {
      color: theme.palette.text.secondary,
    }
  },
}));

function createData(token: any, amount: any, completes: any) {
  return { token, amount, completes};
}
const rows = [
  createData('eCLAW FEB29', 243.23, 'February 29, 2021 @ 12:00 MST'),
];

const Withdrawals: FC = () => {
  const classes = useMainStyles();
  return (
    <Box style={{ marginTop: '2rem' }}>
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <Typography variant="h4">Pending Withdrawals</Typography>
        </Grid>
        <Grid item>
          <Typography variant="body2" color={"textSecondary"}>NOTE: Completed withdrawals are not currently being tracked by Badger.</Typography>
        </Grid>
      </Grid>
      <TableContainer component={Paper} style={{ marginTop: '.5rem', padding: '1rem'}}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow className={classes.tableRowSubdued}>
              <TableCell component="th" scope="row">Token</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell colSpan={2}>Completes On</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.token} className={classes.tableRow}>
                <TableCell>
                  <Typography variant="body1">
                    {row.token}
                  </Typography>
                </TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>
                  <Box style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" style={{ marginRight: '0.5rem' }}>
                      {row.completes}
                    </Typography>
                    <Tooltip title="This withdrawal is under the global average collateral ratio. This transaction has been slowed to ensure a thorough dispute.">
                      <Chip
                        color="primary"
                        icon={<InfoOutlinedIcon/>}
                        label="Slow"
                      />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Button color="primary" variant="outlined" size="small">
                    Cancel Withdrawal
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Withdrawals;