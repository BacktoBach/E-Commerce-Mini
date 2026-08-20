import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { AuthProvider } from "./AuthProvider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
}
