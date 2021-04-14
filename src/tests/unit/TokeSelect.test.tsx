import React from 'react';
import '@testing-library/jest-dom';
import { screen, customRender, fireEvent, within } from '../Utils';
import { TokenSelect } from '../../components-v2/common/TokenSelect';

it('displays placeholder', () => {
	customRender(<TokenSelect placeholder={'Select Token'} onChange={jest.fn()} />);
	expect(screen.getByRole('button', { name: 'Select Token' })).toBeInTheDocument();
});

it('displays options', () => {
	const handleChange = jest.fn();
	customRender(
		<TokenSelect
			placeholder={'Select Token'}
			options={
				new Map<string, string>(
					Object.entries({
						'0x123': 'TestToken',
					}),
				)
			}
			onChange={handleChange}
		/>,
	);

	const selector = screen.getByRole('button', { name: 'Select Token' });
	fireEvent.mouseDown(selector);
	const list = within(screen.getByRole('listbox'));
	expect(list.getByText('TestToken')).toBeInTheDocument();
});

it('returns correct value on change', () => {
	const handleChange = jest.fn();
	customRender(
		<TokenSelect
			placeholder={'Select Token'}
			options={
				new Map<string, string>(
					Object.entries({
						'0x123': 'TestToken',
					}),
				)
			}
			onChange={handleChange}
		/>,
	);

	const selector = screen.getByRole('button', { name: 'Select Token' });
	fireEvent.mouseDown(selector);
	const list = within(screen.getByRole('listbox'));
	fireEvent.click(list.getByText('TestToken'));
	expect(handleChange).toHaveBeenNthCalledWith(1, '0x123');
});
