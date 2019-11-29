import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './LoginPage/LoginPage';
import SignUpPage from './SignUpPage/SignUpPage';
import { SnackbarProvider } from 'notistack';
import { IDatabaseUser } from '../types/types';

interface IProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<IDatabaseUser | null>>;

}

enum formPages {
  login,
  signup
}

const FormManager: React.FC<IProps> = (props) => {

  const { setIsLoading, setUser } = props;
  const [selectedFormPage, setSelectedFormPage] = useState<formPages>(formPages.login)

  const switchForms = useCallback(() => {
    if(selectedFormPage === formPages.login) {
      setSelectedFormPage(formPages.signup)
    } else {
      setSelectedFormPage(formPages.login)
    }
  }, [selectedFormPage])

  const updatePage = useCallback(() => {
      switch(selectedFormPage) {
        case formPages.login:
          return <LoginPage switchForms={switchForms} setIsLoading={setIsLoading} setUser={setUser}/>
        case formPages.signup:
          return <SignUpPage switchForms={switchForms}/>
      }
  }, [selectedFormPage, setIsLoading, setUser, switchForms])

  useEffect(() => {
    updatePage();
  }, [selectedFormPage, setSelectedFormPage, updatePage])

  return (
    <React.Fragment>
        <SnackbarProvider
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            autoHideDuration={3000}
        >
          {updatePage()}
        </SnackbarProvider>
    </React.Fragment>
  );
}

export default FormManager;
