import React, { useEffect, useState } from 'react';
import { FormManager } from './FormManager';
import AppBar from './AppBar';
import GlobalCSS from './GlobalCSS';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { CookiesProvider, useCookies } from 'react-cookie';
import axios from 'axios';
import { Button } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import EmailConfirmation from './EmailConfirmation/EmailConfirmation';
import { IDatabaseUser } from './types/types';
import socketIOClient from "socket.io-client";
import MainGame from './MainGame/MainGame';

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

export const verifyUser = (setUser: React.Dispatch<React.SetStateAction<IDatabaseUser | null>>, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, setSocket?: React.Dispatch<React.SetStateAction<SocketIOClient.Socket | undefined>>) => {
  setIsLoading(true);
  axios.get('http://localhost:8080/user/', { withCredentials: true })
  .then((res) => {
    setIsLoading(false);
    setUser(res.data as IDatabaseUser);
    if(setSocket) {
      const socket = socketIOClient('localhost:8080', {query: `user=${JSON.stringify(res.data)}`});
      setSocket(socket);
    }
  })
  .catch((error) => {
      setIsLoading(false);
      setUser(null)
  })
}

const App: React.FC = () => {

  const [ isLoading, setIsLoading ] = useState(true);
  const [ user, setUser ] = useState<null | IDatabaseUser>(null);
  const [ cookies, setCookie, removeCookie ] = useCookies(['userToken']);
  const [ socket, setSocket ] = useState<SocketIOClient.Socket | undefined>(undefined)

  useEffect(() => {
    verifyUser(setUser, setIsLoading, setSocket);
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
                user.isEmailConfirmed ? 
                  <div>
                    {Object.entries(user).map((detail, index: number) => {
                      return detail[0] === 'dateOfBirth' ?
                        <div key={index}>{detail[0]}: {new Date(detail[1]).toLocaleDateString()}</div>
                        : <div key={index}>{detail[0]}: {detail[1].toString()}</div>
                    })}
                    <Button onClick={() => { removeCookie('userToken'); verifyUser(setUser, setIsLoading) }}>logout</Button>
                    <MainGame />
                  </div>
                : <EmailConfirmation user={user} />
                : <FormManager setIsLoading={setIsLoading} setUser={setUser} />
            }
            </SnackbarProvider>
        </ThemeProvider>
      </CookiesProvider>
    </React.Fragment>
  );
}

export default App;
