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
      '&:first-child': {
        borderLeft: '1px solid rgba(81, 81, 81, 1)',
      },
      '&:last-child': {
        borderRight: '1px solid rgba(81, 81, 81, 1)',
      },
    },
  },
  listItem: {
    borderLeft: '1px solid rgba(81, 81, 81, 1)',
    borderRight: '1px solid rgba(81, 81, 81, 1)',
  },
}));

interface ProposalActionType {
  actions: GovernanceProposalChild[] | GovernanceProposalsDispute[] | GovernanceProposalsStatus[];
  label: string;
}

const ProposalAction = ({ actions, label }: ProposalActionType) => {
  const classes = useStyles();

  const [openAccord, setOpenAccord] = useState<{ [key: string]: boolean }>(() =>
    actions.reduce((acc, action, index) => ({ ...acc, [index]: false }), {}),
  );

  const handleClick = (index: number) => {
    setOpenAccord({
      ...openAccord,
      [index]: !openAccord[index],
    });
  };

  return (
    <Box sx={{ marginTop: 20, marginBottom: 30 }}>
      {actions.map((child: GovernanceProposalChild, index: number) => (
        <React.Fragment key={child.transactionHash}>
          <Divider />
          <ListItem className={classes.listItem} button onClick={() => handleClick(index)}>
            <ListItemText primary={`${label} ${index + 1}`} />
            {openAccord[index] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Divider />
          <Collapse in={openAccord[index]} timeout="auto" unmountOnExit>
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
