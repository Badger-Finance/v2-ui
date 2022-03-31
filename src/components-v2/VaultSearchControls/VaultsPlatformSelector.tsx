import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { makeStyles, MenuItem, TextField } from '@material-ui/core';
import { Protocol } from '@badger-dao/sdk';

const useStyles = makeStyles({
	formControl: {
		width: '100%',
		textTransform: 'capitalize',
	},
	capitalized: {
		textTransform: 'capitalize',
	},
});

interface Props {
	platform?: Protocol;
	onChange: (platform: Protocol) => void;
}

const VaultsPlatformSelector = ({ platform, onChange }: Props): JSX.Element => {
	const {
		vaults: { vaultsProtocols },
	} = useContext(StoreContext);
	const classes = useStyles();

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		onChange(event.target.value as Protocol);
	};

	return (
		<TextField
			select
			variant="outlined"
			size="small"
			value={platform}
			onChange={handleChange}
			label="Platform"
			color="primary"
			className={classes.formControl}
		>
			<MenuItem value={undefined}>
				<em>Platform</em>
			</MenuItem>
			{vaultsProtocols.map((protocol: Protocol) => (
				<MenuItem className={classes.capitalized} key={protocol} value={protocol}>
					{protocol}
				</MenuItem>
			))}
		</TextField>
	);
};

export default observer(VaultsPlatformSelector);
