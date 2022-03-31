import { FormControlLabelProps } from '@material-ui/core';

export type CheckboxControlProps = Omit<FormControlLabelProps, 'control' | 'label' | 'onChange'> & {
	checked: boolean;
	onChange: (checked: boolean) => void;
};
