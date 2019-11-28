/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './LoginPage/LoginPage';
import SignUpPage from './SignUpPage/SignUpPage';
import { SnackbarProvider } from 'notistack';
import { IUser } from '../App';

interface IProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;

}

enum formPages {
  login,
  signup
}

const FormManager: React.FC<IProps> = (props) => {

  const { setIsLoading, setUser } = props;
  const [selectedFormPage, setSelectedFormPage] = useState<formPages>(formPages.login)

  const page = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 1em 0;
  `;
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
      <div css={page}>
        <SnackbarProvider
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            autoHideDuration={3000}
        >
          {updatePage()}
        </SnackbarProvider>
      </div>
    </React.Fragment>
  );
}

export default FormManager;
