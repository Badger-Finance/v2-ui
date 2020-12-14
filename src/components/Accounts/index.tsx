import React from 'react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';

export const Account = observer(() => {
	const { router: { params } } = useContext(StoreContext);

	return (
		<div>
			<h1> Account: {params?.account} </h1>
		</div>
	);
});
