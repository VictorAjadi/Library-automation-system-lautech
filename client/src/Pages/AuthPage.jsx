import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
import SubmitButton from '../components/SubmitButton'
import { FaFolderOpen } from "react-icons/fa";
import CustomImage from '../components/CustomImage';
import useImage from '../hooks/useImage';
import { Link, useSearchParams } from 'react-router-dom';
import { FaImage } from 'react-icons/fa6';
import toast, { Toaster } from 'react-hot-toast';
import { signUpUser, userLogin, userLoginOTP } from '../utils/api';
import { bookSuggestStore, useUserData } from '../hooks/store';
import {convertToBase64} from '../utils/convertToBase64'
import ProgressBar from '../components/ProgressBar';
import OTPTimer from '../components/OTPTimer';
import useBodyBackground from '../hooks/useBodyBackground';

// Styled-components for the form container
const UploadBox = styled.div`
  border: 2px dashed #d3d3d3;
  border-radius: 10px;
  background-color: #f9f9f9;
`;

const IconWrapper = styled.div`
  font-size: 48px;
  color: #4a90e2;
`;
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState('idle');
  const [OTPState, setOTPState] = useState(false);
  const setUserData = useUserData(state=> state.setData);
  const [uploadProgress, setUploadProgress] = useState(0);  
  const setBookData = bookSuggestStore(state=> state.setData);
  const [showLoginForm,setShowLoginForm] = useState(false);
  const [base64String, setBase64String] = useState('');
  const avatar = useImage().avatar;
  const logo = useImage().logo;
  const backgroundImage = useImage().backgroundImage;
  const [searchParams,setSearchParams]=useSearchParams();
  const role=searchParams.get('role') === 'true' ? true : false
  const [codeForm,setCodeForm]=useState({
    code: '',
    email: ''
  });
  // Handle form submission
  const handleSubmit = async(event) => {
    event.preventDefault();
    const form = event.target;
    const formData = isLogin ? {emailOrMatricNo: form.emailOrMatricNo.value,password: form.password.value} : new FormData(form)
    setLoading('submitting');
    const load = toast.loading('Processing...');
    const response = isLogin ? await userLogin(formData,codeForm.code,`${role}`) : await signUpUser(formData,`${role}`)
    setLoading('idle');
    toast.remove(load);
    if(response.status === 'success'){
        toast.success(response.message);
        setUserData(response.profile);
        setBookData(response.suggest);
        //redirect
        window.location.href='/books/library'
    }else{
        toast.error(response.message);
    }
    return;
  };
  const handleFileChange = async(e) => {
    const validatedImage = ["jpg", "jpeg", "png"];
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;
    const fileExtension = file.type.split("/")[1];
    if (!validatedImage.includes(fileExtension)) {
      return toast.error("Invalid image format, use jpg, jpeg, png");
    }
    if (name === "idCard") {
      setUploadProgress(0);
      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };
      reader.onloadend = () => {
        toast.success("File loaded successfully!");
        setUploadProgress(100); // Set progress to 100% on completion
      };
      reader.onerror = () => {
        toast.error("Error loading file.");
        setUploadProgress(0);
      };
      reader.readAsDataURL(file); // This also works for images, can change to `readAsText` if needed
    } else {
      const file=files[0];
      const base64 = await convertToBase64(file)
      setBase64String(base64)
    }
  };
  useBodyBackground(isLogin);
  const handleLoginOTP= async () => {
    if(!codeForm.email) return toast.error('Please enter the email field...');
    setLoading('submitting');
    const load = toast.loading('Sending...');
    const response = await userLoginOTP(codeForm.email);
    setLoading('idle');
    toast.remove(load);
    if(response.status === 'success'){
        toast.success(response.message);
        setShowLoginForm(true);
        setOTPState(prev=>!prev);
    }else{
        toast.error(response.message);
    }
    return;
  };
  const handleFormChange=(e)=>{
    const {value,name}=e.target;
    setCodeForm(prev=>{
      return {...prev,[name]: value};
    })
  }
  const MemoizedOTPTimer = React.useMemo(() => <OTPTimer />, [OTPState]);
  return (
    <div className='my-5'>
      <Toaster position='top-center' reverseOrder={false}/>
      <div className="shadow rounded-2 p-2 px-3 glass w-50 mx-auto glass">
          <div>
            <div className='fw-bold mt-2 mb-3 d-flex flex-column align-items-center justify-content-center'> 
              <h3 className='px-2 fw-bold '>  
                  <CustomImage src={logo} className='rounded-cicle' style={{width: '55px',height: '55px',filter: 'drop-shadow(7px 5px 7px black)'}}/>
              </h3>  
              <h3 className='fw-bold'>{isLogin ? 'Login To Account' : 'Create An Account'}</h3>
            </div>
             <>
              {isLogin ? (
                 <>
                   {
                      showLoginForm ?
                      <form method='POST' onSubmit={handleSubmit} className='d-flex flex-column gap-3'>
                        <div className="form-group">
                          <input type="text" id="code" className="form-control" value={codeForm.code} onChange={handleFormChange} name='code' placeholder="Login Code" />
                        </div>
                        <div className="form-group">
                          <input type="text" className="form-control" name='emailOrMatricNo' placeholder="Email or Matric No" required/>
                        </div>
                        <div className="">
                          <input type="password" className="form-control" name='password' placeholder="Password or Matric No" required/>
                        </div>
                        <div className="mt-3 text-center">
                          <Button variant="link" onClick={handleLoginOTP}>
                            Resend Login Code
                          </Button>
                        </div>
                          {/* Render the Memoized Timer */}
                          {MemoizedOTPTimer}
                        <SubmitButton loading={loading} className='btn btn-primary w-100 p-2 shadow rounded-pill' text={'Login'}/>
                        <div className="mt-3 text-center">
                          Don't have an account?{' '}
                          <Button variant="link" onClick={() =>(setIsLogin(false), setShowLoginForm(false))}>
                            Sign Up
                          </Button>
                        </div>
                      </form> :
                      <div>
                        <div className="form-group text-center text-light">
                          <label htmlFor="email" style={{filter: 'drop-shadow(5px 5px 5px black)'}}>Enter registered email to get login code</label>
                          <input type="email" value={codeForm.email} onChange={handleFormChange}  className="form-control my-2" name='email' placeholder="Email" required/>
                        </div>
                        <div className='d-inline-flex gap-2 my-2 w-100'>
                          <button type='button' onClick={handleLoginOTP} className={`${loading==='idle' ?'btn btn-info':'btn btn-secondary'} border-0 rounded-2 p-2 shadow text-light w-100`} disabled={loading==='submitting'}>{loading==='submitting'?'Sending...':'Get Code'}</button>
                        </div>
                        <div className="mt-3 text-center">
                          Don't have an account?{' '}
                          <Button variant="link" onClick={() =>(setIsLogin(false), setShowLoginForm(false))}>
                            Sign Up
                          </Button>
                        </div>
                        <Link to={'/forgot-password'}>Forgot password</Link>
                      </div>
                   }
                 </>
              ) : ( 
                <form method='POST' onSubmit={handleSubmit} className='d-flex flex-column gap-3' encType="multipart/form-data">
                 <div className='d-flex flex-column align-items-center'>
                    <label htmlFor="profileImg" className='text-center position-relative' style={{ fontSize: "16px", color: "#888888", marginTop: "10px" }}>
                      <CustomImage src={base64String || avatar} className={'rounded-circle'} style={{width: '100px',height: '100px',filter: 'drop-shadow(7px 5px 7px black)'}}/>
                      <span className="position-absolute top-0 start-100 translate-middle badge px-2 d-inline-flex align-items-center  rounded-pill btn btn-primary">
                        <FaImage/>
                      </span>
                    </label>
                    <input type="file" onChange={handleFileChange}  name="profileImg" id="profileImg" accept='image/*' className="d-none" required/>
                 </div>
                 <div className="row">
                    <div className="col">
                      <input type="text" className="form-control shadow" name='name' placeholder="Full Name" required/>
                    </div>
                    {
                      role ? 
                      <div className="col">
                        <input type="password" className="form-control shadow" name='password' placeholder="Password" required/>
                      </div>:
                      <div className="col">
                       <input type="text" className="form-control shadow" name='matricNo' placeholder="Matric No" required/>
                      </div>
                    }
                  </div>
                  <div className="row">
                    <div className="col">
                      <input type="text" className="form-control shadow" name='department' placeholder="Department" required/>
                    </div>
                    <div className="col">
                      <input type="text" className="form-control shadow" name='mobileNumber' placeholder="Mobile Number" required/>
                    </div>
                  </div>
                  <div className="col">
                      <input type="email" className="form-control shadow" name='email' placeholder="Email Address" required/>
                  </div>
                  <UploadBox className='d-flex flex-column gap-2 align-items-center shadow' style={{cursor: 'pointer'}}>
                    <IconWrapper className='text-center'>
                        <FaFolderOpen />
                    </IconWrapper>
                    <label htmlFor="idCard" className='text-center my-2 pointer' style={{ fontSize: "16px", color: "#888888", marginTop: "10px" }}>
                        Click To Upload ID Card
                    </label>
                    <input type="file" onChange={handleFileChange} name="idCard" id="idCard" accept='image/*' className="d-none" required/>
                  </UploadBox>
                  <div className='d-flex justify-content-center'>
                     <ProgressBar progress={uploadProgress} style={{filter: 'drop-shadow(7px 5px 7px black)'}} type='pill' />
                  </div>
                  <SubmitButton loading={loading} className='btn btn-primary w-100 p-2 shadow rounded-pill' text={'Sign Up'}/>
                  <div className=" text-center">
                    Already have an account?{' '}
                    <Button variant="link"  onClick={() => (setIsLogin(true), setShowLoginForm(false))}>
                      Login
                    </Button>
                  </div>
                </form>
              )}
            </>
          </div>
      </div>
    </div>
  );
};

export default Auth;
