import { createContext, useContext, useState, ReactNode } from "react";

interface RefetchContextType {
  needsRefetch: boolean;
  setNeedsRefetch: (value: boolean) => void;
}

interface RefetchContextProviderProps {
  children: ReactNode;
}

// Create the context
const RefetchContext = createContext<RefetchContextType>({
  needsRefetch: false,
  setNeedsRefetch: () => {},
});

// Provider component
export default function RefetchProvider({
  children,
}: RefetchContextProviderProps) {
  const [needsRefetch, setNeedsRefetch] = useState(false);

  return (
    <RefetchContext.Provider value={{ needsRefetch, setNeedsRefetch }}>
      {children}
    </RefetchContext.Provider>
  );
}

// Custom hook for easier usage
export function useRefetch() {
  return useContext(RefetchContext);
}
