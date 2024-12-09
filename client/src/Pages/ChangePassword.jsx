import React, { useState } from 'react';
import styled from 'styled-components';
import BackButton from '../components/BackButton'
import { Link } from 'react-router-dom';
import { getAdminPasswordOTP, updateAdminPassword, updateUserPassword } from '../utils/api';
import toast from 'react-hot-toast';
import { Button } from 'react-bootstrap';
import SubmitButton from '../components/SubmitButton';
import OTPTimer from '../components/OTPTimer';

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 0 10px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 16px;
    margin-bottom: 5px;
  }

  input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #e1e8ed;
    border-radius: 4px;
  }

  a {
    display: block;
    font-size: 14px;
    color: #1da1f2;
    text-decoration: none;
    margin-top: 5px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Info = styled.div`
  font-size: 14px;
  color: #657786;
  margin-bottom: 20px;

  a {
    color: #1da1f2;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;
const Description = styled.p`
  font-size: 14px;
  color: inherit;
`;


const ChangePassword = ({type='user'}) => {
  const [loading,setLoading]=useState('idle');
  const [OTPState, setOTPState] = useState(false);
  const [showForm,setShowForm]=useState(JSON.parse(localStorage.getItem('pwdForm')) || false);
  const [codeForm,setCodeForm]=useState({
    code: ''
  });
  const handleFormChange=(e)=>{
    const {value,name}=e.target;
    setCodeForm(prev=>{
      return {...prev,[name]: value};
    })
  }
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    const form = event.target;
    const body={
      password: form.password.value,
      currentPassword: form.currentPassword.value,
      confirmPassword: form.confirmPassword.value
    }
    if(!body.password) return toast.error('Please enter your new password')
    if(!body.currentPassword) return toast.error('Please enter your current password')
    if(!body.confirmPassword) return toast.error('Please enter confirm password')
    setLoading('submitting');
    const load = toast.loading('Processing...');
    const response = type === 'admin' ? await updateAdminPassword(body,codeForm.code) : await updateUserPassword(body)
    setLoading('idle');
    toast.remove(load);
    if(response.status === 'success'){
        toast.success(response.message);
        localStorage.setItem('pwdForm',false)
        setShowForm(false)
    }else{
        toast.error(response.message);
    }
    return;
  };
  const handlePasswordOTP= async () => {
    setLoading('submitting');
    const load = toast.loading('Sending...');
    const response = await getAdminPasswordOTP();
    setLoading('idle');
    toast.remove(load);
    if(response.status === 'success'){
        toast.success(response.message);
        localStorage.setItem('pwdForm',true)
        setShowForm(true)
        setOTPState(prev=>!prev);
    }else{
        toast.error(response.message);
        localStorage.setItem('pwdForm',false)
        setShowForm(false)
    }
    return;
  };

  return (
    <div className='container mt-4'>
      <Header>
        <BackButton />
      </Header>
      {
          type === 'admin' && !showForm && 
          <>
            <Description>
              Kindly click the button below to get a password change OTP, which you will enter to access the change password form.
            </Description>
            <div className='d-inline-flex gap-2 my-2 w-100'>
              <button type='button' onClick={handlePasswordOTP} className={`${loading==='idle' ?'btn btn-info':'btn btn-secondary'} border-0 rounded-2 p-2 shadow text-light w-100`} disabled={loading==='submitting'}>{loading==='submitting'?'Getting...':'Get Code'}</button>
            </div>
          </>
        }
      <form method="PATCH" onSubmit={handleSubmit}>
        {
          (showForm || type==='student') && 
          <>
           {
            type === 'admin' && 
              <FormGroup>
                <label htmlFor="code">PWD Code</label>
                <input type="text" id="code" value={codeForm.code} onChange={handleFormChange} name='code' placeholder="Passcode OTP Code" />
              </FormGroup>
            }

            <FormGroup>
              <label htmlFor="current-password">Current password</label>
              <input type="password" id="current-password"  name='currentPassword' placeholder="Current password" />
              <Link to="/admins/forgot-password">Forgot password?</Link>
            </FormGroup>

            <FormGroup>
              <label htmlFor="new-password">New password</label>
              <input type="password" name='password' id="new-password" placeholder="New password" />
            </FormGroup>

            <FormGroup>
              <label htmlFor="confirm-password">Confirm password</label>
              <input type="password" name='confirmPassword' id="confirm-password" placeholder="Confirm password" />
            </FormGroup>
            {
            type === 'admin' && 
              <div className='mx-auto d-flex flex-column gap-2 '>
                <Button variant="link" onClick={handlePasswordOTP}>
                  Reset Code
                </Button>
                <OTPTimer timeLimitInSecs={120} OTPState={OTPState} />
              </div>
          }
            <SubmitButton loading={loading} className='btn btn-primary w-100 p-2 shadow rounded-pill' text={'Save'}/>
          </>
        }
      </form>
    </div>
  );
};

export default ChangePassword;
