import React, { useEffect, useState } from 'react';
import { FormManager } from './FormManager';
import AppBar from './AppBar';
import GlobalCSS from './GlobalCSS';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { CookiesProvider, useCookies } from 'react-cookie';
import axios from 'axios';
import { Button } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';

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

export interface IUser {
  _id: string,
  firstname: string,
  lastname: string,
  username: string,
  dateOfBirth: string,
  email: string,
}

export const verifyUser = (setUser: React.Dispatch<React.SetStateAction<IUser | null>>, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  setIsLoading(true);
  axios.get('http://localhost:8080/user/', { withCredentials: true })
  .then((res) => {
    setIsLoading(false);
    setUser(res.data as IUser);
  })
  .catch((error) => {
      setIsLoading(false);
      setUser(null)
  })
}

const App: React.FC = () => {

  const [ isLoading, setIsLoading ] = useState(true);
  const [ user, setUser ] = useState<null | IUser>(null);
  const [ cookies, setCookie, removeCookie ] = useCookies(['userToken']);

  useEffect(() => {
    verifyUser(setUser, setIsLoading)
  }, [])

  return (
    <React.Fragment>
      <CookiesProvider>
      <GlobalCSS />
        <ThemeProvider theme={theme}>
          <SnackbarProvider
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              autoHideDuration={3000}
          >
            <AppBar />
              {isLoading ? 
                <div>Loading...</div>
                : user ? 
                  <div>
                    {Object.entries(user).map((detail, index: number) => {
                      return detail[0] === 'dateOfBirth' ? 
                        <div key={index}>{detail[0]}: {new Date(detail[1]).toLocaleDateString()}</div>
                      : <div key={index}>{detail[0]}: {detail[1]}</div>
                    })}
                    <Button onClick={() => { removeCookie('userToken'); verifyUser(setUser, setIsLoading) }}>logout</Button>
                  </div>
                  : <FormManager setIsLoading={setIsLoading} setUser={setUser}/>
              }
            </SnackbarProvider>
        </ThemeProvider>
      </CookiesProvider>
    </React.Fragment>
  );
}

export default App;
