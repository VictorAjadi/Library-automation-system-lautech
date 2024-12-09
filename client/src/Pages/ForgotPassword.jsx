import React, { useState } from "react";
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import SubmitButton from "../components/SubmitButton";
import useImage from "../hooks/useImage";
import toast, { Toaster } from "react-hot-toast";
import { passwordResetToken, userPasswordResetToken } from "../utils/api";
import CustomImage from "../components/CustomImage";
import useBodyBackground from "../hooks/useBodyBackground";

const background = useImage().backgroundImage;
const ForgotPasswordContainer = styled.div`
  font-family: "Roboto", sans-serif;
  background: url("${background}") no-repeat center center fixed;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
`;
const StyledContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;

  h1 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    color: #fff;
  }

  p {
    margin-bottom: 1.5rem;
    color: #fff;
  }

  form {
    display: flex;
    flex-direction: column;

    input[type="email"] {
      padding: 0.75rem;
      margin-bottom: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
    }

    button {
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      background-color: #007bff;
      color: #fff;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: #0056b3;
      }
    }
  }

  .back-to-login {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;

    a {
      color: #007bff;
      text-decoration: none;
      margin-left: 0.5rem;
      transition: color 0.3s ease;

      &:hover {
        color: #0056b3;
      }
    }
  }
`;

const ForgotPassword = ({type='user'}) => {
    const [loading,setLoading] = useState('idle');
    const logo = useImage().logo;
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission
        const email = event.target.email.value; // Get the email value from the form
        if (!email) {
          toast.error("Please enter an email address.");
          return;
        }
        setLoading('submitting');
        const load = toast.loading('Sending...');
        const response = type === 'admin' ? await passwordResetToken(email) : await userPasswordResetToken(email);
        setLoading('idle');
        toast.remove(load);
        if(response.status === 'success'){
            toast.success(response.message);
        }else{
            toast.error(response.message);
        }
        return;
      };
      useBodyBackground();
      
  return (
    <ForgotPasswordContainer className="mt-5">
      <Toaster position='top-center' reverseOrder={false}/>
      <StyledContainer>
        <CustomImage src={logo} className='rounded-cicle' style={{width: '55px',height: '55px',filter: 'drop-shadow(7px 5px 7px black)'}}/>
        <h1>Forgot Password</h1>
        <p>
          Enter your email address below and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} method="POST">
          <input type="email" name="email" placeholder="Email Address" required />
          <SubmitButton className="btn btn-primary rounded-2 shadow" loading={loading} text={loading==='idle'?'Send Link':'Sending...'}/>
        </form>
        <div className="back-to-login">
          <FaArrowLeft />
          <Link to={type==='admin' ? "/admins/auth" : '/auth'}>Back to Login</Link>
        </div>
      </StyledContainer>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;
