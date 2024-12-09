import React, { useState } from "react";
import styled from "styled-components";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { resetPassword, userResetPassword } from "../utils/api";
import CustomImage from "../components/CustomImage";
import useImage from "../hooks/useImage";
import SubmitButton from "../components/SubmitButton";
import useBodyBackground from "../hooks/useBodyBackground";
import OTPTimer from "../components/OTPTimer";

const Container = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
  margin: auto;
  color: #fff;
`;

const Input = styled.input`
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
`;

const BackToLogin = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #007bff;
  cursor: pointer;

  a {
    text-decoration: none;
    color: inherit;
    margin-left: 0.5rem;
    transition: color 0.3s ease;
  }

  a:hover {
    color: #0056b3;
  }
`;

const ResetPassword = ({type='user'}) => {
  const logo = useImage().logo;
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const {resetToken} = useParams();
  const [loading,setLoading] = useState('idle');
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = formData;
    if (!password || !confirmPassword) {
      toast.error("Both fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading('submitting');
    const load = toast.loading('Resetting...');
    const response = type==='admin' ? await resetPassword(resetToken,formData) : await userResetPassword(resetToken,formData)
    setLoading('idle');
    toast.remove(load);
    if(response.status === 'success'){
        toast.success(response.message);
        // Redirect to login
        window.location.href = type==='admin' ? "/admins/auth" : '/auth';
    }else{
        toast.error(response.message);
        return;
    }
  };
  useBodyBackground();
  return (
    <Container className="mt-5">
      <Toaster position='top-center' reverseOrder={false}/>
      <CustomImage src={logo} className='rounded-cicle' style={{width: '55px',height: '55px',filter: 'drop-shadow(7px 5px 7px black)'}}/>
      <h1>Reset Password</h1>
      <p>Enter your new password below.</p>
      <form method="PATCH" onSubmit={handleSubmit}>
        <Input
          type="password"
          name="password"
          placeholder="New Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <OTPTimer timeLimitInSecs={120} />
        <SubmitButton className="btn btn-primary rounded-2 shadow" loading={loading} text={loading==='idle'?'Reset Password':'Resetting...'}/>
      </form>
      <BackToLogin>
        <FaArrowLeft />
        <Link to={type==='admin' ? "/admins/auth" : '/auth'}>Back to Login</Link>
      </BackToLogin>
    </Container>
  );
};

export default ResetPassword;
