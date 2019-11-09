/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage/LoginPage';
import SignUpPage from './SignUpPage/SignUpPage';

interface IProps {

}

enum formPages {
  login,
  signup
}

const FormManager: React.FC<IProps> = (props) => {

  const [selectedFormPage, setSelectedFormPage] = useState<formPages>(formPages.signup)

  const page = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 1em 0;
  `;

  const updatePage = (selectedFormPage: formPages) => {
    switch(selectedFormPage) {
      case formPages.login:
        return <LoginPage switchForms={switchForms}/>
      case formPages.signup:
        return <SignUpPage switchForms={switchForms}/>
    }
  }

  const switchForms = () => {
    if(selectedFormPage === formPages.login) {
      setSelectedFormPage(formPages.signup)
    } else {
      setSelectedFormPage(formPages.login)
    }
  }

  useEffect(() => {  
    updatePage(selectedFormPage)
  }, [selectedFormPage, setSelectedFormPage])

  return (
    <React.Fragment>
      <div css={page}>
        {updatePage(selectedFormPage)}
      </div>
    </React.Fragment>
  );
}

export default FormManager;
