import React, { KeyboardEvent } from 'react';
import { IconButton, InputAdornment, makeStyles, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

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
	onSearch: () => void;
}

const VaultSearchBar = ({ search = '', onChange, onSearch }: Props): JSX.Element => {
	const classes = useStyles();

	const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			onSearch();
		}
	};

	return (
		<TextField
			InputProps={{
				endAdornment: (
					<InputAdornment position="end">
						<IconButton size="small" aria-label="search" onClick={onSearch} className={classes.icon}>
							<SearchIcon />
						</IconButton>
					</InputAdornment>
				),
			}}
			inputProps={{ 'aria-label': 'Vault Search' }}
			size="small"
			variant="outlined"
			className={classes.root}
			value={search}
			placeholder="Search by vault name, token, rewards..."
			onKeyPress={handleKeyPress}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
};

export default VaultSearchBar;
