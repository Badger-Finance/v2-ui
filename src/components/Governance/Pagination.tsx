import { makeStyles, Typography } from '@material-ui/core';
import classNames from 'classnames';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  paginationWrapper: {
    padding: theme.spacing(2, 0),
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      right: theme.spacing(1),
    },
  },
  pageItem: {
    background: 'transparent',
    border: 'none',
    height: theme.spacing(5),
    width: theme.spacing(5),
    margin: theme.spacing(0.5),
    borderRadius: '50%',
    cursor: 'pointer',
  },
  active: {
    backgroundColor: `${theme.palette.background.paper}`,
  },
  sides: {
    boxShadow: 'transparent 0px 0px 0px 1px, transparent 0px 0px 0px 4px, rgba(0, 0, 0, 0.18) 0px 2px 4px',
  },
}));
export interface Props {
  page: number;
  totalPages: number;
  handlePagination: (page: number) => void;
}
export const PaginationComponent: React.FC<Props> = ({ page, totalPages, handlePagination }) => {
  const classes = useStyles();
  const pageJsx: JSX.Element[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageJsx.push(
      <button
        onClick={() => handlePagination(i)}
        type="button"
        className={classNames(classes.pageItem, {
          [classes.active]: page === i,
        })}
        key={i}
      >
        <Typography variant="subtitle1" color="textSecondary">
          {i}
        </Typography>
      </button>,
    );
  }
  return (
    <div>
      <div className={classes.paginationWrapper}>
        <button
          onClick={() => handlePagination(page - 1)}
          type="button"
          className={classNames([classes.pageItem, classes.sides].join(' '))}
        >
          <Typography variant="subtitle1" color="textSecondary">
            &lt;
          </Typography>
        </button>
        {pageJsx}
        <button
          onClick={() => handlePagination(page + 1)}
          type="button"
          className={[classes.pageItem, classes.sides].join(' ')}
        >
          <Typography variant="subtitle1" color="textSecondary">
            &gt;
          </Typography>
        </button>
      </div>
    </div>
  );
};
export const Pagination = PaginationComponent;
