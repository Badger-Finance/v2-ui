export const getSelectedText = () => {
  let text: string | undefined = '';
  if (typeof window?.getSelection != 'undefined') {
    text = window?.getSelection()?.toString();
  }
  return text;
};
