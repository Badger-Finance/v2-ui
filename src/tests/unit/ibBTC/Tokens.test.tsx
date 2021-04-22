import React from 'react';
import '@testing-library/jest-dom';
import store from '../../../mobx/store';
import addresses from 'config/ibBTC/addresses.json';
import { TokenModel } from '../../../mobx/model';
import { Tokens } from '../../../components/IbBTC/Tokens';
import { customRender, screen, fireEvent, within } from '../../Utils';

const tokens = [
	new TokenModel(store, addresses.mainnet.contracts.tokens['bcrvRenWSBTC']),
	new TokenModel(store, addresses.mainnet.contracts.tokens['bcrvRenWBTC']),
	new TokenModel(store, addresses.mainnet.contracts.tokens['btbtc/sbtcCrv']),
];

// this is a workaround for the 'TypeError: document.createRange is not a function' error using the tooltip
// see https://github.com/mui-org/material-ui/issues/15726
(global as any).document.createRange = () => ({
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setStart: () => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setEnd: () => {},
	commonAncestorContainer: {
		nodeName: 'BODY',
		ownerDocument: document,
	},
});

it('starts with the first token as default value', () => {
	customRender(<Tokens selected={tokens[0]} tokens={tokens} onTokenSelect={jest.fn()} />);
	expect(screen.getByRole('button', { name: `${tokens[0].name} ${tokens[0].symbol}` })).toBeInTheDocument();
});

it.each(tokens)('displays token information', (token) => {
	customRender(<Tokens selected={tokens[0]} tokens={tokens} onTokenSelect={jest.fn()} />);
	fireEvent.click(screen.getByRole('button'), { name: `${token.name} ${token.symbol}` });
	expect(within(screen.getByRole('tooltip')).getByText(token.symbol)).toBeInTheDocument();
});

it.each(tokens)('triggers on token select handler with correct information', (token) => {
	const handleClick = jest.fn();
	customRender(<Tokens selected={tokens[0]} tokens={tokens} onTokenSelect={handleClick} />);
	fireEvent.click(screen.getByRole('button'), { name: `${token.name} ${token.symbol}` });
	fireEvent.click(within(screen.getByRole('tooltip')).getByText(token.symbol));
	expect(handleClick).toHaveBeenNthCalledWith(1, token);
});
