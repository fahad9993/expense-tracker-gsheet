import React, { createContext, useContext, useState } from "react";

const KeyboardContext = createContext<{
  isKeyboardVisible: boolean;
  setKeyboardVisible: (visible: boolean) => void;
}>({
  isKeyboardVisible: false,
  setKeyboardVisible: () => {},
});

export const KeyboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  return (
    <KeyboardContext.Provider value={{ isKeyboardVisible, setKeyboardVisible }}>
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboard = () => useContext(KeyboardContext);
