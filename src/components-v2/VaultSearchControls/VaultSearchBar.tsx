import { IconButton, InputAdornment, makeStyles, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';

const useStyles = makeStyles({
	root: {
		width: '100%',
	},
	icon: {
		margin: -3,
	},
});

interface Props {
	search?: string;
	onChange: (search: string) => void;
}

const VaultSearchBar = ({ search = '', onChange }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<TextField
			InputProps={{
				endAdornment: (
					<InputAdornment position="end">
						<IconButton size="small" aria-label="search" className={classes.icon}>
							<SearchIcon />
						</IconButton>
					</InputAdornment>
				),
			}}
			inputProps={{ 'aria-label': 'Vault Search' }}
			variant="outlined"
			className={classes.root}
			value={search}
			placeholder="Search by vault name, token, rewards..."
			onChange={(e) => onChange(e.target.value)}
		/>
	);
};

export default VaultSearchBar;
