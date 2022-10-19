import React, {
  createContext,
  FunctionComponent,
  useContext,
  useState,
} from "react";
import { LogDrawerUiState } from "../hooks/use-log-drawer";
import { NavigationUiState } from "../hooks/use-navigation";

interface UiStateContextProps {
  children: any;
}

type Props = UiStateContextProps;

const UiStateContext: any = createContext<any>([{}, () => undefined]);

export function useUiStateContext() {
  return useContext<any>(UiStateContext);
}

export interface UiState extends LogDrawerUiState, NavigationUiState {
  placeholder: { [key: string]: string };
  searchTerm: { [key: string]: string };
  searchDisabled: boolean;

  [key: string]: any;
}

export const defaultUiState: UiState = {
  placeholder: { default: "Search" },
  searchTerm: { default: "" },
  searchDisabled: false,
  logDrawerSize: "tiny",
  breadcrumbs: [],
  isNavigationDrawerVisible: false,
  isShowBackButtonVisible: true,
  isSearchBarVisible: true,
};

export const UiStateContextProvider: FunctionComponent<Props> = ({
  children,
}) => {
  const [state, setState] = useState<UiState>(defaultUiState);
  return (
    <UiStateContext.Provider value={[state, setState]}>
      {children}
    </UiStateContext.Provider>
  );
};