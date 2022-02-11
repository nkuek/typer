import React, { FC, useContext } from 'react';
import { Box } from '@mui/system';
import { IndexContext, ThemeContext } from 'providers';
import Char from './Char';
import { ICharList, IChars } from 'providers/WordListProvider';

interface IProps {
  wordIdx: number;
  word: IChars;
  charList: ICharList;
}

const Word: FC<IProps> = (props) => {
  const { wordIdx, word, charList } = props;
  const { theme } = useContext(ThemeContext);
  const { currentWordIndex } = useContext(IndexContext);

  return (
    <Box
      color={wordIdx === currentWordIndex ? theme.currentWord : theme.words}
      key={wordIdx}
      sx={{
        display: 'flex',
        margin: '0.25em',
        textDecoration: word.skipped
          ? `underline ${theme.incorrect || 'red'}`
          : 'none',
        flexWrap: 'wrap',
      }}
    >
      {word.chars.map((char, charIdx) => (
        <Char
          key={`${char.char}${charIdx}`}
          wordIdx={wordIdx}
          char={char}
          charIdx={charIdx}
          charList={charList}
        />
      ))}
    </Box>
  );
};

export default Word;
