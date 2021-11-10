import {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import useStyles from './styles';
import randomizeWords from 'words';
import { WordContext } from 'WordContext';

const calculateWpm = (charCount: number, timer: number) =>
  Math.floor(charCount / 5 / (timer / 60));

const WordBox = () => {
  const values = useContext(WordContext);

  const {
    wordList,
    setWordList,
    wordCount,
    setWpm,
    timerId,
    setTimerId,
    wpm,
    setWpmData,
    timer,
    setTimer,
  } = values;

  const classes = useStyles();

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);

  const wordRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLDivElement>(null);

  const charList = useMemo(() => {
    const charList = [];
    if (wordList) {
      for (const word of wordList) {
        charList.push([...word]);
      }
    }
    return charList;
  }, [wordList]);

  const handleReset = useCallback(() => {
    if (wordRef.current && textFieldRef.current) {
      if (!userInput && !currentWordIndex && !currentCharIndex) {
        setWordList(randomizeWords(wordCount));
      } else {
        const words = wordRef.current.children;
        for (const word of words) {
          for (const char of word.children) {
            char.classList.remove(classes.correct);
            char.classList.remove(classes.incorrect);
            char.classList.remove(classes.currentChar);
          }
          word.classList.remove(classes.currentWord);
        }
      }
      setUserInput('');
      setCurrentCharIndex(0);
      setCurrentWordIndex(0);
      setIncorrectChars(0);
      setWpm(0);
      setWpmData([]);
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
        setTimer(1);
        setCharCount(0);
      }
    }
    document.getElementsByTagName('input')[0].focus();
  }, [
    wordRef,
    textFieldRef,
    setWordList,
    userInput,
    currentWordIndex,
    currentCharIndex,
    classes,
    wordCount,
    setTimerId,
    timerId,
  ]);

  // Timer for WPM
  useEffect(() => {
    if (userInput.length > 0 && !timerId) {
      const intervalTimer = setInterval(
        () => setTimer((prev) => prev + 1),
        1000
      );
      setTimerId(intervalTimer);
    }
  }, [userInput, timerId, currentWordIndex, setTimerId]);

  useEffect(() => {
    setWpm(calculateWpm(charCount, timer));
  }, [timer, charCount, setWpm]);

  // handle character count when user presses delete
  useEffect(() => {
    if (timerId) {
      const handleDelete = (e: KeyboardEvent) => {
        if (e.key === 'Backspace' && userInput) {
          setCharCount((prev) => prev - 2);
          setUserInput((prev) => prev.slice(0, userInput.length));
        }
      };
      document.addEventListener('keydown', handleDelete);
      return () => document.removeEventListener('keydown', handleDelete);
    }
  }, [userInput, timerId, charCount]);

  // focus on input field whenever charList changes
  useEffect(() => {
    if (charList.length > 0) {
      document.getElementsByTagName('input')[0].focus();
    }
  }, [charList]);

  // input field logic
  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (wordRef.current && currentWordIndex < charList.length) {
      setUserInput(e.target.value);
      const currentWord = wordRef.current.children[currentWordIndex];

      const lastUserChar = e.target.value[e.target.value.length - 1];

      // handle space
      if (lastUserChar === ' ') {
        // if user presses space with no input, do nothing
        if (currentCharIndex === 0) {
          setUserInput('');
          return;
        }
        // if user presses space before reaching the end of the word, make entire word incorrect and remove other styling
        if (currentCharIndex - 1 !== charList[currentWordIndex].length - 1) {
          let i = currentCharIndex;
          if (e.target.value.length > charList[currentWordIndex].length) i = 0;
          for (i; i < currentWord.children.length; i++) {
            const child = currentWord.children[i];
            child.classList.remove(classes.currentChar);
            child.classList.add(classes.incorrect);
          }
        }

        // set wpm data timestep
        const extraChars =
          e.target.value.length - 1 - charList[currentWordIndex].length > 0
            ? e.target.value.length - 1 - charList[currentWordIndex].length
            : 0;
        const missingChars =
          charList[currentWordIndex].length - currentCharIndex;
        setWpmData((prev) => [
          ...prev,
          {
            word: wordList[currentWordIndex],
            wordNum: currentWordIndex + 1,
            errors: missingChars + extraChars + incorrectChars,
            wpm,
            missingChars,
            extraChars,
            incorrectChars,
          },
        ]);

        // else move to next word
        setCurrentCharIndex(0);
        setCurrentWordIndex((prev) => prev + 1);
        setCharCount((prev) => prev + 1);
        setIncorrectChars(0);
        setUserInput('');
      } else {
        // if the user completely clears input box, remove all classes
        if (e.target.value.length === 0) {
          for (let i = 0; i < currentWord.children.length; i++) {
            const child = currentWord.children[i];
            child.classList.remove(classes.correct);
            child.classList.remove(classes.incorrect);
            child.classList.remove(classes.currentChar);
            currentWord.children[0].classList.add(classes.currentChar);
          }
          // if user deletes character from input, remove that character's styling
        } else if (
          e.target.value.length < currentCharIndex &&
          e.target.value.length <= charList[currentWordIndex].length
        ) {
          currentWord.children[currentCharIndex - 1].classList.remove(
            classes.incorrect
          );
          currentWord.children[currentCharIndex - 1].classList.remove(
            classes.correct
          );
          if (currentCharIndex < charList[currentWordIndex].length)
            currentWord.children[currentCharIndex].classList.remove(
              classes.currentChar
            );
        }
        // move to next character
        if (e.target.value.length <= charList[currentWordIndex].length) {
          setCurrentCharIndex(e.target.value.length);
          setCharCount((prev) => prev + 1);
        }
      }
    }
  };

  // Verifying words logic
  useEffect(() => {
    if (
      wordRef.current &&
      userInput.length > 0 &&
      currentWordIndex < charList.length
    ) {
      // if user types more chars than the current word's length, do nothing
      if (userInput.length > charList[currentWordIndex].length) return;

      const correct =
        userInput[userInput.length - 1] ===
        charList[currentWordIndex][currentCharIndex - 1];

      const currentWord = wordRef.current.children[currentWordIndex];

      if (currentCharIndex < charList[currentWordIndex].length) {
        currentWord.children[currentCharIndex].classList.add(
          classes.currentChar
        );
      }

      if (correct) {
        currentWord.children[currentCharIndex - 1].classList.add(
          classes.correct
        );
        currentWord.children[currentCharIndex - 1].classList.remove(
          classes.currentChar
        );
      } else if (!correct) {
        currentWord.children[currentCharIndex - 1].classList.add(
          classes.incorrect
        );
        currentWord.children[currentCharIndex - 1].classList.remove(
          classes.currentChar
        );
        setIncorrectChars((prev) => prev + 1);
      }
    }
  }, [currentCharIndex, userInput, currentWordIndex, wordRef]); // eslint-disable-line

  // Current word logic
  useEffect(() => {
    if (
      wordRef.current &&
      wordList.length > 0 &&
      currentWordIndex < charList.length
    ) {
      wordRef.current.children[currentWordIndex].classList.add(
        classes.currentWord
      );
      if (currentCharIndex < charList[currentWordIndex].length) {
        wordRef.current.children[currentWordIndex].children[
          currentCharIndex
        ].classList.add(classes.currentChar);
      }
    }
    if (
      currentWordIndex === charList.length - 1 &&
      userInput === wordList[wordList.length - 1] &&
      timerId
    ) {
      clearInterval(timerId);
    }
  }, [currentWordIndex, wordRef, wordList, currentCharIndex]); //eslint-disable-line

  return (
    <Container
      sx={{
        border: '1px solid black',
        padding: '2em',
        borderRadius: 5,
      }}
    >
      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', marginBottom: '2em' }}
        ref={wordRef}
      >
        {charList.map((word, idx) => (
          <Box key={idx} sx={{ display: 'flex', margin: '0.25em' }}>
            {word.map((char, idx) => (
              <Box key={char + idx}>{char}</Box>
            ))}
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          height: 60,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextField
          sx={{ width: '80%', boxSizing: 'border-box' }}
          variant="outlined"
          value={userInput}
          onChange={handleUserInput}
          autoFocus={true}
          ref={textFieldRef}
        />
        <Button
          sx={{ height: '95%', width: '20%' }}
          variant="outlined"
          onClick={handleReset}
        >
          Redo
        </Button>
      </Box>
    </Container>
  );
};

export default WordBox;
