import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import SubmitButton from '../components/SubmitButton'
import CustomImage from '../components/CustomImage';
import useImage from '../hooks/useImage';
import toast, { Toaster } from 'react-hot-toast';
import { adminLogin, adminLoginOTP } from '../utils/api';
import { bookSuggestStore, useUserData } from '../hooks/store';
import OTPTimer from '../components/OTPTimer';
import { Link } from 'react-router-dom';

const AdminAuth = () => {
  const [loading, setLoading] = useState('idle');
  const [OTPState, setOTPState] = useState(false);
  const setUserData = useUserData(state=> state.setData);
  const setBookData = bookSuggestStore(state=> state.setData);
  const [showLoginForm,setShowLoginForm] = useState(false);
  const logo = useImage().logo;
  const backgroundImage = useImage().backgroundImage;
  const [codeForm,setCodeForm]=useState({
    code: '',
    email: ''
  });
  // Handle form submission
  const handleSubmit = async(event) => {
    event.preventDefault();
    const form = event.target;
    setLoading('submitting');
    const load = toast.loading('Processing...');
    const response = await adminLogin({password: form.password.value,email: codeForm.email},codeForm.code) 
    setLoading('idle');
    toast.remove(load);
    if(response.status === 'success'){
        toast.success(response.message);
        setUserData(response.profile);
        setBookData(response.suggest);
        //redirect
        window.location.href='/admins/console/books/library'
    }else{
        toast.error(response.message);
    }
    return;
  };

  React.useEffect(() => {
    document.body.style.backgroundImage = `url("${backgroundImage}")`;
    document.body.style.backgroundSize = `cover`; // Scales the background image to cover the entire viewport
    document.body.style.backgroundRepeat = `no-repeat`; // Prevents the background from repeating
    document.body.style.backgroundPosition = `center`; // Centers the background image
    document.body.style.height = "100vh"; // Ensure the body occupies the full viewport height
    document.body.style.margin = "0"; // Remove any default margin
  }, [backgroundImage]);
  const handleLoginOTP= async () => {
    if(!codeForm.email) return toast.error('Please enter the email field...');
    setLoading('submitting');
    const load = toast.loading('Sending...');
    const response = await adminLoginOTP(codeForm.email);
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
  return (
    <div className='my-5'>
      <Toaster position='top-center' reverseOrder={false}/>
      <div className="shadow rounded-2 p-2 px-3 glass w-50 mx-auto glass">
          <div>
            <div className='fw-bold mt-2 mb-3 d-flex flex-column align-items-center justify-content-center'> 
              <h3 className='px-2 fw-bold '>  
                  <CustomImage src={logo} className='rounded-cicle' style={{width: '55px',height: '55px',filter: 'drop-shadow(7px 5px 7px black)'}}/>
              </h3>  
              <h3 className='fw-bold'>Login To Account</h3>
            </div>
                <>
                {
                    showLoginForm ?
                    <form method='POST' onSubmit={handleSubmit} className='d-flex flex-column gap-3'>
                        <div className="form-group">
                            <input type="text" id="code" className="form-control" value={codeForm.code} onChange={handleFormChange} name='code' placeholder="Login Code" />
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
                        <OTPTimer timeLimitInSecs={120} OTPState={OTPState} />
                        <SubmitButton loading={loading} className='btn btn-primary w-100 p-2 shadow rounded-pill' text={'Login'}/>
                    </form> :
                    <div>
                        <div className="form-group text-center text-light">
                            <label htmlFor="email" style={{filter: 'drop-shadow(5px 5px 5px black)'}}>Enter registered email to get login code</label>
                            <input type="email" value={codeForm.email} onChange={handleFormChange}  className="form-control my-2" name='email' placeholder="Email" required/>
                        </div>
                        <Link to={'/admins/forgot-password'}>Forgot password</Link>
                        <div className='d-inline-flex gap-2 my-2 w-100'>
                            <button type='button' onClick={handleLoginOTP} className={`${loading==='idle' ?'btn btn-info':'btn btn-secondary'} border-0 rounded-2 p-2 shadow text-light w-100`} disabled={loading==='submitting'}>{loading==='submitting'?'Sending...':'Get Code'}</button>
                        </div>
                    </div>
                }
                </>
          </div>
      </div>
    </div>
  );
};

export default AdminAuth;
