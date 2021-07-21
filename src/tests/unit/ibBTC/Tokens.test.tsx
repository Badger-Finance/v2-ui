import React from 'react';
import '@testing-library/jest-dom';
import store from '../../../mobx/RootStore';
import addresses from 'config/ibBTC/addresses.json';
import { Tokens } from '../../../components/IbBTC/Tokens';
import { customRender, screen, fireEvent, within } from '../../Utils';
import { IbbtcOptionToken } from '../../../mobx/model/tokens/ibbtc-option-token';

const tokens = [
	new IbbtcOptionToken(store, addresses.mainnet.contracts.tokens['bcrvRenWSBTC']),
	new IbbtcOptionToken(store, addresses.mainnet.contracts.tokens['bcrvRenWBTC']),
	new IbbtcOptionToken(store, addresses.mainnet.contracts.tokens['btbtc/sbtcCrv']),
];

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
