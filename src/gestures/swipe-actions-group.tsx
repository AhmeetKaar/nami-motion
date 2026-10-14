import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";

type CloseRow = () => void;

type SwipeActionsGroupValue = {
  activate: (close: CloseRow) => void;
  release: (close: CloseRow) => void;
};

const SwipeActionsGroupContext = createContext<SwipeActionsGroupValue | null>(null);

export type SwipeActionsGroupProps = {
  children?: ReactNode;
};

export function SwipeActionsGroup({ children }: SwipeActionsGroupProps) {
  const current = useRef<CloseRow | null>(null);

  const value = useMemo<SwipeActionsGroupValue>(
    () => ({
      activate: (close) => {
        if (current.current && current.current !== close) {
          current.current();
        }
        current.current = close;
      },
      release: (close) => {
        if (current.current === close) {
          current.current = null;
        }
      },
    }),
    [],
  );

  return (
    <SwipeActionsGroupContext.Provider value={value}>
      {children}
    </SwipeActionsGroupContext.Provider>
  );
}

export function useSwipeActionsGroup() {
  return useContext(SwipeActionsGroupContext);
}
