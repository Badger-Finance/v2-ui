import React from 'react';
import '@testing-library/jest-dom';
import { customRender, fireEvent, screen } from '../Utils';
import { PercentageGroup } from '../../components-v2/common/PercentageGroup';

test('display options', () => {
	customRender(<PercentageGroup options={[17]} onChange={jest.fn()} />);
	expect(
		screen.getByRole('button', {
			name: '17%',
		}),
	).toBeInTheDocument();
});

test('handle percentage selection', () => {
	customRender(<PercentageGroup options={[25, 50, 75, 100]} onChange={jest.fn()} />);
	expect(
		screen.getByRole('button', {
			name: '25%',
		}),
	);
	expect(
		screen.getByRole('button', {
			name: '50%',
		}),
	);
	expect(
		screen.getByRole('button', {
			name: '75%',
		}),
	);
	expect(
		screen.getByRole('button', {
			name: '100%',
		}),
	);
});

test('handle percentage selection', () => {
	const handleChange = jest.fn();
	customRender(<PercentageGroup options={[25, 50]} onChange={handleChange} />);
	const percentageButton = screen.getByRole('button', {
		name: '25%',
	});
	expect(percentageButton).toBeInTheDocument();
	fireEvent.click(percentageButton);
	expect(handleChange).toHaveBeenNthCalledWith(1, 25);
});
