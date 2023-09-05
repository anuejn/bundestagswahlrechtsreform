import React from 'react';
import ReactDOM from 'react-dom';
import 'tufte-css/tufte.css';
import Essay from './essay.mdx';
import { MDXProvider } from '@mdx-js/react';
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material';

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'));
});

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <MDXProvider>
        <Essay />
      </MDXProvider>
    </ThemeProvider>
  );
}
