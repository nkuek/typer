import { useCallback, useContext, useEffect, useState } from 'react';
import WordBox from '../components/WordBox';
import Box from '@mui/material/Box';
import WordOptions from '../components/WordOptions';
import {
  WordContext,
  ThemeContext,
  WordListContext,
  TimeContext,
} from 'providers';
import Stats from 'components/Stats';
import { Container, Typography } from '@mui/material';
import Settings from 'components/Settings';
import { TReactSetState } from 'providers/general/types';
import AboutMe from 'components/AboutMe';
import Tip from 'components/Tip';

const App = () => {
  const { wordCount } = useContext(WordListContext);
  const { wpmData, setFocused, textFieldRef, settings } =
    useContext(WordContext);
  const { theme } = useContext(ThemeContext);
  const { timer } = useContext(TimeContext);

  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [aboutMeOpen, setAboutMeOpen] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const closeDialog = (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>,
    setDialog: TReactSetState<boolean>
  ) => {
    e.stopPropagation();
    setDialog(false);
    if (textFieldRef.current) {
      setFocused(true);
      setTimeout(() => textFieldRef.current!.focus(), 1);
    }
  };

  // handle pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape')
        document.getElementsByTagName('button')[0].click();
      setShowTip(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setShowTip]);

  const gradientUnderline = useCallback(
    (dialogOpen) => ({
      backgroundImage: `linear-gradient(90deg, ${
        (theme.gradientUnderline && theme.gradientUnderline[0]) || 'red'
      }, ${(theme.gradientUnderline && theme.gradientUnderline[1]) || 'blue'})`,
      backgroundSize: `${dialogOpen ? 100 : 0}% 3px`,
      backgroundPosition: 'left bottom',
      backgroundRepeat: 'no-repeat',
      transition: 'background-size 300ms ease-in-out',
      '&:hover': {
        backgroundSize: '100% 3px',
      },
    }),
    [theme]
  );

  const displayStats =
    (settings.type === 'timed' && timer.time === 0) ||
    (settings.type !== 'timed' && Object.keys(wpmData).length === wordCount);

  return (
    <div
      style={{
        fontFamily: 'Roboto',
        background: theme.pageBackground,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => setFocused(false)}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 40,
          fontSize: 'clamp(2rem, 5vw + .5rem, 3rem)',
          color: theme.headings || theme.currentWord,
          padding: '1rem 0',
        }}
      >
        archetyper
      </Box>
      <Container
        sx={{
          height: 'calc(100% - 80px)',
          display: 'flex',
          alignItems: displayStats ? 'start' : 'center',
          justifyContent: 'center',
          padding: 0,
          position: 'relative',
        }}
      >
        {displayStats ? (
          <Stats />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '75%',
              minHeight: '30%',
              top: -64,
              position: 'relative',
            }}
          >
            <WordOptions />
            <WordBox setShowTip={setShowTip} setShowWarning={setShowWarning} />
            <Tip
              showTip={showTip}
              setShowTip={setShowTip}
              tip="press esc at any time to restart"
            />
            <Tip
              showTip={showWarning}
              setShowTip={setShowWarning}
              tip="caps lock is enabled"
              warning
            />
          </Box>
        )}
      </Container>
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 40,
          fontSize: 'clamp(1rem, 5vw + .25rem, 1.5rem)',
          color: theme.headings || theme.currentWord,
        }}
      >
        <Typography
          onClick={() => setSettingsDialogOpen(true)}
          sx={{
            ...gradientUnderline(settingsDialogOpen),
            cursor: 'pointer',
            fontSize: 'inherit',
          }}
        >
          settings
        </Typography>
        <Typography
          sx={{
            margin: '0 .5em',
            fontSize: 'inherit',
          }}
        >
          /
        </Typography>
        <Typography
          onClick={() => setAboutMeOpen(true)}
          sx={{
            ...gradientUnderline(aboutMeOpen),
            cursor: 'pointer',
            fontSize: 'inherit',
          }}
        >
          about me
        </Typography>
      </Container>
      <Settings
        open={settingsDialogOpen}
        onClose={(e) => closeDialog(e, setSettingsDialogOpen)}
      />
      <AboutMe
        open={aboutMeOpen}
        onClose={(e) => closeDialog(e, setAboutMeOpen)}
      />
    </div>
  );
};

export default App;
