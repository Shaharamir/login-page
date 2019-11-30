/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { Container } from '../shared';
import { IDatabaseUser } from '../types/types';
import { Typography, Button } from '@material-ui/core';
import axios from 'axios';

interface IProps {
    user: IDatabaseUser
}

const EmailConfirmation: React.FC<IProps> = (props) => {
    const { user } = props;

    const header = css`
      display: flex;
      justify-content: center;
      margin-bottom: 0.2em;
    `;

    const resendEmail = () => {
      axios.post('http://localhost:8080/user/resendEmailConfirmation/', user)
      .then((res) => {
        console.log(res.data);
      }).catch((error) => {
        console.log(error);
      })
    }

  return (
    <Container>
        <Typography variant="h4" css={header}>Verify Email</Typography>
        <div>Hey <b>{user.username}</b>,</div>
        <div>Please verify your email adress: <b>{user.email}</b></div>
        <div css={css`margin-top: 1em;`}>Didn't recieve the mail? <Button variant="outlined" css={css`margin-left: 1em;`} onClick={resendEmail}>resend it now</Button></div>
    </Container>
  );
}

export default EmailConfirmation;