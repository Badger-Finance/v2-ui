import React from 'react';
import '@testing-library/jest-dom';
import { customRender, fireEvent, screen } from '../Utils';
import { TokenAmountInput } from '../../components-v2/common/TokenAmountInput';

test('displays placeholder', () => {
	customRender(<TokenAmountInput placeholder={'0.123'} onChange={jest.fn()} />);
	expect(screen.getByPlaceholderText('0.123')).toBeInTheDocument();
});

test('handles valid change', () => {
	const handleChange = jest.fn();
	customRender(<TokenAmountInput placeholder={'0.123'} onChange={handleChange} />);
	fireEvent.change(screen.getByRole('textbox'), { target: { value: '123' } });
	expect(handleChange).toHaveBeenNthCalledWith(1, '123');
});

test('skips invalid change', () => {
	const handleChange = jest.fn();
	customRender(<TokenAmountInput placeholder={'0.123'} onChange={handleChange} />);
	fireEvent.change(screen.getByRole('textbox'), { target: { value: 'asd' } });
	expect(handleChange).not.toHaveBeenCalled();
});
