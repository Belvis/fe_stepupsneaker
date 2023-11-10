import { RefineThemes } from "@refinedev/antd";
import { ConfigProvider, theme } from "antd";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

type ColorModeContextType = {
  mode: string;
  setMode: (mode: string) => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const colorModeFromLocalStorage = localStorage.getItem("colorMode");
  const isSystemPreferenceDark = window?.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const systemPreference = isSystemPreferenceDark ? "dark" : "light";
  const [mode, setMode] = useState(
    colorModeFromLocalStorage || systemPreference
  );

  useEffect(() => {
    window.localStorage.setItem("colorMode", mode);
  }, [mode]);

  const setColorMode = () => {
    if (mode === "light") {
      setMode("dark");
    } else {
      setMode("light");
    }
  };

  const { darkAlgorithm, defaultAlgorithm } = theme;

  return (
    <ColorModeContext.Provider
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <ConfigProvider
        // you can change the theme colors here. example: ...RefineThemes.Magenta,
        theme={{
          ...RefineThemes.Orange,
          algorithm: mode === "light" ? defaultAlgorithm : darkAlgorithm,
          // token: {
          //   // Seed Token
          //   // colorPrimary: '#00b96b',
          //   // borderRadius: 2,
          //   // // Alias Token
          //   // colorBgContainer: '#f6ffed',
          // },
          components: {
            Table: {
              headerBg: mode === "light" ? "#fb5231" : "#141414",
              headerColor: mode === "light" ? "#ffffff" : undefined,
              // borderColor: mode === "light" ? "#ffffff" : undefined,
              rowHoverBg: mode === "light" ? "#fff2e8" : undefined,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
