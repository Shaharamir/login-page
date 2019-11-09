/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Chip } from '@material-ui/core';
import useForm from 'react-hook-form';

interface IProps {
  switchForms: () => void;
}

const LoginPage: React.FC<IProps> = (props) => {

  const { switchForms } = props;
  const { register, handleSubmit, errors } = useForm();

  const [formData, setFormDate] = useState();


  const container = css`
    /* position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, 50%); */
    padding: 1em;
    width: 70%;
    min-width: 19em;
  `;

  const header = css`
    display: flex;
    justify-content: center;
    margin-bottom: 0.2em;
  `;

  const textFieldsContainer = css`
    display: flex;
    flex-direction: column;
    padding: 0.1em;
  `;

  const formInputs = css`
    margin-top: 0.6em;
  `;

  const onSubmit = (data: any) => {
    setFormDate(data);
    console.log(data);
  };

  return (
    <Paper css={container}>
      <div>
        <Typography css={header} variant="h4">Login</Typography>
        <Chip label="Are you new? Sign Up!" onClick={switchForms} clickable variant="outlined" />
      </div>
      <form css={textFieldsContainer} onSubmit={handleSubmit(onSubmit)}>
        {/* USERNAME */}
        <TextField css={formInputs}
          variant="outlined"
          label="Username/Email *"
          error={errors.username ? true : false}
          name="username"
          inputRef={register({
            required: true,
            pattern: { value: /^[a-zA-Z0-9_.-]{3,15}$|[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, message: '* Username is not valid' }
          })}
        />
        {/* PASSWORD */}
        <TextField css={formInputs}
          type="password"
          variant="outlined"
          label="Password *"
          error={errors.password ? true : false}
          name="password"
          inputRef={register({
            required: true,
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
              message: '* Password is not valid'
            }
          })}
        />
        <Button css={formInputs} type="submit" variant="outlined" color="primary">Enter</Button>
      </form>
    </Paper>
  );
}

export default LoginPage;
