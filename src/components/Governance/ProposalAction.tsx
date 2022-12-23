import { GovernanceProposalAction, GovernanceProposalsDispute, GovernanceProposalsStatus } from '@badger-dao/sdk';
import {
  Box,
  Collapse,
  Divider,
  List,
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
import { decamelize, isObject } from 'utils/componentHelpers';

const useStyles = makeStyles(() => ({
  table: {
    borderTop: '1px solid rgba(81, 81, 81, 1)',
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
  actions: Array<GovernanceProposalsDispute | GovernanceProposalsStatus | GovernanceProposalAction>;
  label: string;
  open?: boolean;
}

const ProposalAction = ({ actions, label, open = false }: ProposalActionType) => {
  const classes = useStyles();

  const [openAccord, setOpenAccord] = useState<{ [key: string]: boolean }>(() =>
    new Array(actions.length)
      .fill('')
      .reduce(
        (acc: { [key: string]: boolean }, _, index) => ({ ...acc, [index]: open && index === 0 ? true : false }),
        {},
      ),
  );

  const handleClick = (index: number) => {
    setOpenAccord({
      ...openAccord,
      [index]: !openAccord[index],
    });
  };

  const renderValue = (key: string, value: any) => {
    if (typeof value !== 'object' && value) {
      return value;
    } else if (isObject(value)) {
      const { inputTypes, ...rest } = value;
      return (
        <Table size="small" className={classes.table}>
          <TableBody>{renderAction(rest)}</TableBody>
        </Table>
      );
    } else if (Array.isArray(value)) {
      return (
        <List dense={true}>
          {value.map((data) => (
            <>
              <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
                {typeof data !== 'object' ? JSON.stringify(data) : data?.hex}
              </ListItem>
              {value.length > 1 && <Divider />}
            </>
          ))}
        </List>
      );
    }
  };

  const renderAction = (obj: GovernanceProposalsDispute | GovernanceProposalsStatus | GovernanceProposalAction) => {
    return (Object.keys(obj) as Array<keyof typeof obj>).map((key) => (
      <TableRow key={key}>
        <TableCell>
          <Typography noWrap variant="body2" color="primary">
            {decamelize(key, ' ')}
          </Typography>
        </TableCell>
        <TableCell>{renderValue(key, obj[key])}</TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      {actions.map((action, index: number) => (
        <Box key={index} sx={{ marginTop: 8, marginBottom: 0 }}>
          <React.Fragment key={index}>
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
                    <TableBody>{renderAction(action)}</TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Collapse>
          </React.Fragment>
        </Box>
      ))}
    </>
  );
};

export default ProposalAction;
