import { WordContext } from 'providers';
import { WordListContext } from 'providers/WordListProvider';
import { defaultWordBoxConfig } from 'providers/WordProvider';
import { useCallback, useContext } from 'react';
import randomizeWords from 'words';
import useQuote from './useQuote';

const useReset = (randomize = false) => {
  const { wordList, setWordList, setAuthor, wordCount } =
    useContext(WordListContext);
  const {
    wordRef,
    textFieldRef,
    timer,
    setTimer,
    setWpm,
    setWpmData,
    setUserInput,
    setInputHistory,
    settings,
    wordBoxConfig,
    setWordBoxConfig,
  } = useContext(WordContext);

  const { getQuote } = useQuote();

  return useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
      e.stopPropagation();
      const { currentCharIndex, currentWordIndex } = wordBoxConfig;
      if (wordRef.current && textFieldRef.current) {
        wordRef.current.children[0]?.scrollIntoView({
          block: 'center',
        });
      }
      // if a user has not started a test or has finished the test, give them a new word list
      if ((!timer.id && !currentWordIndex && !currentCharIndex) || randomize) {
        if (settings.quotes) {
          getQuote();
        } else {
          setWordList(randomizeWords(settings, wordCount));
          setAuthor(null);
        }
        // otherwise reset to the current word list
      } else {
        setWordList([...wordList]);
      }
      setUserInput('');
      setInputHistory([]);
      setWordBoxConfig(defaultWordBoxConfig);
      setWpm({ net: 0, raw: 0 });
      setWpmData({});
      if (timer.id) {
        clearInterval(timer.id);
        setTimer({ id: null, time: 1 });
      }
    },
    [
      wordRef,
      textFieldRef,
      setWordList,
      timer,
      setTimer,
      setWpm,
      setWpmData,
      setUserInput,
      randomize,
      settings,
      getQuote,
      setAuthor,
      setInputHistory,
      wordBoxConfig,
      setWordBoxConfig,
      wordList,
    ]
  );
};

export default useReset;
