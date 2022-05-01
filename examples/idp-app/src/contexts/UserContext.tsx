import { createContext } from 'react';

export interface IUser {
  user_id:  string;
  username: string;
  token:    string;
}

export interface IUserCtxData {
  user?: IUser | null;
  setUser(newVal: IUser | null): void;
}

export const UserContext = createContext<IUserCtxData>({ setUser: () => {}});

export const UserContextProvider = UserContext.Provider;
export const UserContextConsumer = UserContext.Consumer;
