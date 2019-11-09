/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useState, useRef } from 'react';
import { Paper, Typography, TextField, Button, Fade, Chip, Popper } from '@material-ui/core';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker, MaterialUiPickersDate } from '@material-ui/pickers';
import useForm from 'react-hook-form';
import ReCAPTCHA from "react-google-recaptcha";

interface IProps {
  switchForms: () => void;
}

const SignUpPage: React.FC<IProps> = (props) => {
  
  const { switchForms } = props;
  const recaptchaRef = useRef(null);
  const { register, handleSubmit, errors, watch } = useForm();
  
  const [selectedDate, setSelectedDate] = useState<MaterialUiPickersDate>(new Date());
  const [formData, setFormDate] = useState();
  const [isRecaptchaValid, setIsRecaptchaValid] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [inputMessage, setInputMessage] = useState<String | null>(null);
  

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

const formInputsContainer = css`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const formInputs = css`
  margin-top: 0.6em;
  width: 100%;
`;

const errorMessage = css`
  color: #f77e75;
  margin-top: 1em;
  margin-left: 1em;
  position: absolute;
  right: 1em;
`;

  const dateChanged = (date: MaterialUiPickersDate) => {
    if(date) {
      const today = new Date();
      if(today.setHours(0,0,0,0) > date.setHours(0,0,0,0)) {
        setSelectedDate(date);
      }
      else {
        alert('Are you a time traveler?')
      }
    }
  }

  const onSubmit = (data: any) => {
    setFormDate(data);
    console.log(data);
  };

  const recaptchaChanged = (token: string | null) => {
    if(token) {
      setIsRecaptchaValid(true);
    }
  }

  const onInputFocus = (message: String) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputMessage(message);
    setAnchorEl(e.currentTarget);
  }

  const onInputBlur = () => {
    setInputMessage(null);
    setAnchorEl(null);
  }

  return (
    <React.Fragment>
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="top-start"
      modifiers={{
        flip: {
          enabled: true,
        },
        preventOverflow: {
          enabled: true,
          boundariesElement: 'undefined',
        },
        arrow: {
          enabled: true,
          element: anchorEl,
        },
      }}
      transition
      css={css`padding: 1em 0; z-index: 1; max-width: 18em;`}
    >
      {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <Typography css={css`padding: 1em;`} variant="body1">{inputMessage}</Typography>
            </Paper>
          </Fade>
        )}
    </Popper>
    <Paper css={container}>
      <div>
        <Typography css={header} variant="h4">Sign Up</Typography>
        <Chip label="Already have a user? Log In" onClick={switchForms} clickable variant="outlined" />
      </div>
      <form css={textFieldsContainer} onSubmit={handleSubmit(onSubmit)}>
        {/* FIRST NAME */}
        <div css={formInputsContainer}>
          <Fade in={errors.firstname && errors.firstname.message ? true : false} timeout={500}>
            <Typography css={errorMessage} variant="subtitle2">{errors.firstname && errors.firstname.message}</Typography>
          </Fade>
          <TextField css={formInputs}
            variant="outlined"
            label="First Name *"
            error={errors.firstname ? true : false}
            name="firstname" 
            inputRef={register({
              required: true,
              pattern: { value: /^[a-zA-Z](\s?[a-zA-Z]){2,29}$/, message: '* First Name is not valid'}
            })}
            onFocus={onInputFocus('First Name minimum length is 3 letters up to 30 and can only contain the letters A-Z')} 
            onBlur={onInputBlur}
          />
        </div>
        {/* LAST NAME */}
        <div css={formInputsContainer}>
          <Fade in={errors.lastname && errors.lastname.message ? true : false} timeout={500}>
            <Typography css={errorMessage} variant="subtitle2">{errors.lastname && errors.lastname.message}</Typography>
          </Fade>
          <TextField css={formInputs}
            variant="outlined"
            label="Last Name *"
            error={errors.lastname ? true : false}
            name="lastname"
            inputRef={register({
              required: true,
              pattern: { value: /^[a-zA-Z](\s?[a-zA-Z']){2,29}$/, message: '* Last Name is not valid'}
            })}
            onFocus={onInputFocus('Last Name minimum length is 3 letters up to 30 and can only contain the letters A-Z')} 
            onBlur={onInputBlur}
          />
        </div>
        {/* USERNAME */}
        <div css={formInputsContainer}>
          <Fade in={errors.username && errors.username.message ? true : false} timeout={500}>
            <Typography css={errorMessage} variant="subtitle2">{errors.username && errors.username.message}</Typography>
          </Fade>
          <TextField css={formInputs}
            variant="outlined"
            label="Username *"
            error={errors.username ? true : false}
            name="username"
            inputRef={register({
              required: true,
              pattern: { value: /^[a-zA-Z0-9_.-]{3,15}$/, message: '* Username is not valid'}
            })}
            onFocus={onInputFocus('Username minimum is 3 letters up to 15 and can only contain the letters A-Z and ("_", ".", "-"))')} 
            onBlur={onInputBlur}
          />
        </div>
        {/* DATE OF BIRTH */}
        <div css={formInputsContainer}>
          <Fade in={false}><Typography css={errorMessage} variant="subtitle2"></Typography></Fade>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              css={formInputs}
              format="MM/dd/yyyy"
              margin="none"
              inputVariant="outlined"
              onChange={dateChanged}
              InputAdornmentProps={{ position: "start" }}
              value={selectedDate}
              label="Date Of Birth *"
              error={errors.dateOfBirth ? true : false}
              name="dateOfBirth"
              inputRef={register({ required: true })}
            />
          </MuiPickersUtilsProvider>
        </div>
        {/* EMAIL */}
        <div css={formInputsContainer}>
          <Fade in={errors.email && errors.email.message ? true : false} timeout={500}>
            <Typography css={errorMessage} variant="subtitle2">{errors.email && errors.email.message}</Typography>
          </Fade>
          <TextField css={formInputs}
            variant="outlined"
            label="Email *"
            error={errors.email ? true : false}
            name="email"
            inputRef={register({ 
              required: true,
              pattern: {
                value: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                message: '* Email Adress is not valid'
              }
            })}
          />
        </div>
        {/* PASSWORD */}
        <div css={formInputsContainer}>
          <Fade in={errors.password && errors.password.message ? true : false} timeout={500}>
            <Typography css={errorMessage} variant="subtitle2">{errors.password && errors.password.message}</Typography>
          </Fade>
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
            onFocus={onInputFocus('Password must be atleat the length of 8 and contain atleat one of each (Lowercase Uppercase and Number)')}
            onBlur={onInputBlur}
          />
        </div>
        {/* CONFIRM PASSWORD */}
        <div css={formInputsContainer}>
          <Fade in={false}><Typography css={errorMessage} variant="subtitle2"></Typography></Fade>
          <TextField css={formInputs} 
            type="password"
            variant="outlined"
            label="Confirm Password *"
            error={errors.confirmPassword ? true : false}
            name="confirmPassword"
            inputRef={register({ 
              required: true,
              validate: (value) => {
                return value === watch('password');
              },
            })}
            onFocus={onInputFocus('Passwords must match')}
            onBlur={onInputBlur}
          />
        </div>
        <ReCAPTCHA
          css={formInputs}
          ref={recaptchaRef}
          sitekey="6LcPz8EUAAAAAMCOfT7FDeTufYqSALiBtskgWKXi"
          onChange={recaptchaChanged}
        />
        <Button css={formInputs} type="submit" variant="outlined" color="primary">SIGN ME UP PLEASE!</Button>
      </form>
    </Paper>
    </React.Fragment>
  );
}

export default SignUpPage;
