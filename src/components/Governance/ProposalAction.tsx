import { GovernanceProposalChild, GovernanceProposalsDispute, GovernanceProposalsStatus } from '@badger-dao/sdk';
import {
  Box,
  Collapse,
  Divider,
  ListItem,
  ListItemText,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import React, { useState } from 'react';

const useStyles = makeStyles(() => ({
  table: {
    '& td': {
      padding: 8,
      wordBreak: 'break-all',
      borderBottom: 0,
      '&:first-child': {
        borderLeft: '1px solid rgba(81, 81, 81, 1)',
      },
      '&:last-child': {
        borderRight: '1px solid rgba(81, 81, 81, 1)',
      },
    },
    '& tr': {
      '&:last-child': {
        borderBottom: '1px solid rgba(81, 81, 81, 1)',
      },
    },
  },
  listItem: {
    borderLeft: '1px solid rgba(81, 81, 81, 1)',
    borderRight: '1px solid rgba(81, 81, 81, 1)',
  },
}));

interface ProposalActionType {
  actions: GovernanceProposalsDispute[] | GovernanceProposalsStatus[];
  label: string;
}

const ProposalAction = ({ actions, label }: ProposalActionType) => {
  const classes = useStyles();

  const [openAccord, setOpenAccord] = useState<boolean>(false);

  return (
    <Box sx={{ marginTop: 20, marginBottom: 20 }}>
      <Divider />
      <ListItem className={classes.listItem} button onClick={() => setOpenAccord(!openAccord)}>
        <ListItemText primary={`${label}`} />
        {openAccord ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Divider />
      {actions.map((child: GovernanceProposalChild) => (
        <React.Fragment key={child.transactionHash}>
          <Collapse in={openAccord} timeout="auto" unmountOnExit>
            <Box sx={{ marginY: 0 }}>
              <TableContainer>
                <Table size="small" className={classes.table}>
                  <TableBody>
                    {(Object.keys(child) as Array<keyof typeof child>).map((key) => (
                      <TableRow>
                        <TableCell>
                          <Typography noWrap variant="body2" color="primary">
                            {key}
                          </Typography>
                        </TableCell>
                        <TableCell>{child[key]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </React.Fragment>
      ))}
    </Box>
  );
};

export default ProposalAction;
