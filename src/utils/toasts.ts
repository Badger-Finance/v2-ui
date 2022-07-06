import { Id, toast, ToastContent } from 'react-toastify';

import { TX_COMPLETED_TOAST_DURATION } from '../components-v2/TransactionToast';

export function showWalletPromptToast(message: string): Id {
  return toast.info(message, {
    autoClose: false,
  });
}

export function updateWalletPromptToast(id: Id, message: string): void {
  if (toast.isActive(id)) {
    toast.update(id, {
      render: message,
      autoClose: undefined,
    });
  } else {
    toast.info(message, {
      autoClose: undefined,
    });
  }
}

export function showTransferSignedToast(id: Id, render: ToastContent): void {
  if (toast.isActive(id)) {
    toast.update(id, {
      render,
      type: 'info',
      autoClose: TX_COMPLETED_TOAST_DURATION,
    });
  } else {
    toast.info(render, { autoClose: TX_COMPLETED_TOAST_DURATION });
  }
}

export function showTransferRejectedToast(id: Id, message: string) {
  if (toast.isActive(id)) {
    toast.update(id, {
      type: 'warning',
      render: message,
      autoClose: undefined,
    });
  } else {
    toast.warning(message);
  }
}
