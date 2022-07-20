import { Link, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(() => ({
  link: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

interface Props {
  text: string[];
  onClick?: (link: string) => void | undefined;
}

const MarkupText = ({ text, onClick }: Props): JSX.Element => {
  const classes = useStyles();
  const parseText = (text: string[], createLink: (a: string, b: string) => JSX.Element) => {
    return (
      <>
        {text.map((t) => {
          if (t.startsWith('[')) {
            const name = t.substring(1, t.indexOf(']'));
            const link = t.substring(t.indexOf('(') + 1, t.length - 1);
            return createLink(name, link);
          } else {
            return t;
          }
        })}
      </>
    );
  };

  const createLink = (text: string, link: string) => {
    if (!link.includes('http') && onClick !== undefined) {
      return (
        <Link key={text} display="inline" className={classes.link} onClick={() => onClick(link)}>
          {text}
        </Link>
      );
    }
    return (
      <Link key={text} href={link} target="_blank" rel="noopener" display="inline">
        {text}
      </Link>
    );
  };

  return <>{parseText(text, createLink)}</>;
};

export default MarkupText;
