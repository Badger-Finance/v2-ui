import { RootStore } from './store';
import { createContext } from 'react';

// Use React context to make your store available in your application
export const StoreContext = createContext({} as RootStore);
export const StoreProvider = StoreContext.Provider;
