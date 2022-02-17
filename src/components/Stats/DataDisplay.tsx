import React, { FC, useContext } from 'react';
import { Container, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ThemeContext } from 'providers';
import CustomTooltip from 'components/CustomTooltip';

interface IProps {
  title: string;
  data: number | string;
  unit?: string;
  tooltip?: string;
}

const DataDisplay: FC<IProps> = ({ title, data, unit, tooltip }) => {
  const { theme } = useContext(ThemeContext);
  const renderContent = () => {
    const children = (
      <Box fontSize="1.5em" sx={{ textAlign: 'center' }}>
        {data}
        {unit || ''}
      </Box>
    );
    if (tooltip) {
      return <CustomTooltip title={tooltip}>{children}</CustomTooltip>;
    } else {
      return children;
    }
  };

  return (
    <Container
      sx={{
        color: theme.headings,
        marginBottom: '1em',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box fontSize="1.1em">{title}</Box>
      {renderContent()}
    </Container>
  );
};

export default DataDisplay;
