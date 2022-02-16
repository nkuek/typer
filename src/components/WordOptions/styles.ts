import { ThemeContext, WordContext } from 'providers';
import { ISettings } from 'providers/WordProvider';
import { useCallback, useContext, useMemo } from 'react';

const useWordOptionTheme = (type: ISettings['type']) => {
  const { theme, textColor } = useContext(ThemeContext);
  const { settings } = useContext(WordContext);

  const optionContainerStyle = useMemo(
    () =>
      ({
        display: 'flex',
        opacity: settings.type === type ? 1 : 0,
        visibility: settings.type === type ? 'visible' : 'hidden',
        transition: 'opacity 250ms linear, visibility 0s',
        position: settings.type === type ? 'relative' : 'absolute',
      } as const),
    [settings.type, type]
  );

  const getOptionStyle = useCallback(
    (condition: boolean) =>
      ({
        padding: '0em .5em',
        cursor: 'pointer',
        color: condition ? theme.currentWord : textColor,
        opacity: condition ? 1 : 0.6,
        transition: 'opacity 250ms ease-in-out',
        '&:hover': {
          opacity: 1,
        },
        fontWeight: condition ? 'bold' : 'normal',
      } as const),
    [theme, textColor]
  );

  const getOptionTypographyStyle = useCallback(
    (condition: boolean) =>
      ({
        display: 'flex',
        alignItems: 'center',
        lineHeight: 'normal',
        height: 20,
        boxSizing: 'border-box',
        fontWeight: condition ? 'bold' : 'normal',
        borderColor: 'inherit',
      } as const),
    []
  );

  return useMemo(
    () => ({
      getOptionStyle,
      optionContainerStyle,
      getOptionTypographyStyle,
    }),
    [optionContainerStyle, getOptionStyle, getOptionTypographyStyle]
  );
};

export default useWordOptionTheme;
