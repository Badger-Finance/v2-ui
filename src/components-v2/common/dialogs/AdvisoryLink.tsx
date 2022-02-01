import { Link, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(() => ({
	linkContainer: {
		display: 'flex',
		justifyContent: 'center',
		fontSize: '0.95rem',
	},
}));

interface AdvisoryLinkProps {
  href: string;
  linkText: string;
}

const AdvisoryLink = ({ href, linkText }: AdvisoryLinkProps): JSX.Element => {
	const classes = useStyles();
  return (
			<div className={classes.linkContainer}>
      <Link
        target="_blank"
        rel="noreferrer"
        // TODO: Update with information on the remuneration vault link
        href={href}
      >
        {linkText}
      </Link>
    </div>
  )
};

export default AdvisoryLink;
