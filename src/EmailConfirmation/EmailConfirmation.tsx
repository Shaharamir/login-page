/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useState } from 'react';
import { Container } from '../shared';
import { IDatabaseUser } from '../types/types';
import { Typography, Button, CircularProgress } from '@material-ui/core';
import axios from 'axios';

interface IProps {
    user: IDatabaseUser;
}

const EmailConfirmation: React.FC<IProps> = (props) => {
    const { user } = props;

    const [isResendEmailLoading, setIsResendEmailLoading] = useState(false);

    const header = css`
      display: flex;
      justify-content: center;
      margin-bottom: 0.2em;
    `;

    const didntRecieveContainer = css`
      margin-top: 1em;
    `;

    const resendButton = css`
      margin-left: 1em;
    `;

    const resendEmail = () => {
      setIsResendEmailLoading(true);
      axios.post('http://localhost:8080/user/resendEmailConfirmation/', user)
      .then((res) => {
        // console.log(res.data);
        setIsResendEmailLoading(false);
      }).catch((error) => {
        console.log(error);
        setIsResendEmailLoading(false)
      })
    }

  return (
    <Container>
        <Typography variant="h4" css={header}>Verify Email</Typography>
        <div>Hey <b>{user.username}</b>,</div>
        <div>Please verify your email adress: <b>{user.email}</b></div>
        <div css={didntRecieveContainer}>
          <span></span>Didn't recieve the mail?
          <Button variant="outlined" css={resendButton} onClick={resendEmail} disabled={isResendEmailLoading}>{isResendEmailLoading ? <CircularProgress /> : 'resend it now'}</Button>
        </div>
    </Container>
  );
}

export default EmailConfirmation;