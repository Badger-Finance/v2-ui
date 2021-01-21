import { createContext } from 'react';
import { RootStore } from './store';

// Use React context to make your store available in your application
export const StoreContext = createContext({} as RootStore);
export const StoreProvider = StoreContext.Provider;
