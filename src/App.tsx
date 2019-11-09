import React from 'react';
import { FormManager } from './FormManager';
import AppBar from './AppBar';
import GlobalCSS from './GlobalCSS';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';


const App: React.FC = () => {

  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#1e88e5',
      },
      secondary: {
        main: '#00c853',
      },
    },
  });

  return (
    <React.Fragment>
      <GlobalCSS />
      <ThemeProvider theme={theme}>
        <AppBar />
        <FormManager />
      </ThemeProvider>
    </React.Fragment>
  );
}

export default App;
