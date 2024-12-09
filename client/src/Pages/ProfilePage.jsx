import React, { useState } from "react";
import styled from "styled-components";
import { FaEdit, FaFolderOpen, FaSave } from "react-icons/fa";
import SubmitButton from "../components/SubmitButton";
import CustomImage from "../components/CustomImage";
import useImage from "../hooks/useImage";
import { convertToBase64 } from "../utils/convertToBase64";
import toast from "react-hot-toast";
import { updateAdminDetails, updateUserDetails } from "../utils/api";
import { useUserData } from "../hooks/store";
import ProgressBar from "../components/ProgressBar";
import BackButton from "../components/BackButton";
import ModalButton from "../components/ModalButton";

const Container = styled.form`
  background: inherit;
  padding: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  gap: 30px;
`;
const UploadBox = styled.div`
  border: 2px dashed #d3d3d3;
  border-radius: 10px;
  background-color: #f9f9f9;
`;

const IconWrapper = styled.div`
  font-size: 48px;
  color: #4a90e2;
`;


const ProfilePage = () => {
  const avatar = useImage().avatar
  const userData = useUserData(state=>state.state);
  const [loading, setLoading] = useState('idle');
  const [base64String, setBase64String] = useState('');
  const setUserData = useUserData(state=> state.setData);
  const [uploadProgress, setUploadProgress] = useState(0);  
  // Handle form submission
  const handleSubmit = async(event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form)
    setLoading('submitting');
    const load = toast.loading('Processing...');
    const response = (userData.role==='admin' || userData.role==='sub-admin') ? await updateAdminDetails(formData) : await updateUserDetails(formData)
    setLoading('idle');
    toast.remove(load);
    if(response.status === 'success'){
        toast.success(response.message);
        setUserData(response.profile);
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
  return (
    <div className="mt-5">
      <div className="align-self-start">
        <BackButton />
      </div>
      <div className='d-flex justify-content-end gap-3' style={{width: '95%'}}>
        <div>
          <ModalButton
            buttonText='Show Barcode'
            buttonClassname='btn btn-primary p-2 px-3 fw-medium text-light rounded-pill shadow'
            title={'Barcode'}
            children={
              <div className="d-flex mx-auto justify-content-center">
                <CustomImage src={userData?.barcode} className={'rounded-3'} style={{width: '300px',height: '300px',filter: 'drop-shadow(7px 5px 7px black)'}}/>
              </div>
            }
          />
        </div>
        <div>
            <ModalButton
                buttonText='Show ID Card'
                buttonClassname='btn btn-primary p-2 px-3 fw-medium text-light rounded-pill shadow'
                title={'ID Card'}
                children={
                <div className="d-flex mx-auto justify-content-center">
                  <CustomImage src={userData?.idCard?.url} className={'rounded-3'} style={{width: '100%',maxHeight: '400px',filter: 'drop-shadow(7px 5px 7px black)'}}/>
                </div>
                }
            />        
        </div>
      </div>
      <Container method="PATCH" onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="w-100 rounded-2 p-3 shadow text-center bg-secondary school-bg" style={{borderImage: 'fill 0 linear-gradient(#0001, #444)'}}>
        <div className='d-flex w-100 flex-column align-items-center'>
          <label htmlFor="profileImg" className='text-center position-relative' style={{ fontSize: "16px", color: "#888888", marginTop: "10px" }}>
            <CustomImage src={base64String || userData?.profileImg?.url || avatar} className={'rounded-circle'} style={{width: '135px',height: '135px',filter: 'drop-shadow(7px 5px 7px black)'}}/>
            <span className="position-absolute top-0 start-100 translate-middle badge px-2 d-inline-flex align-items-center  rounded-pill btn btn-primary">
              <FaEdit />
            </span>
          </label>
          <input type="file" onChange={handleFileChange}  name="profileImg" id="profileImg" accept='image/*' className="d-none"/>
        </div>
        <div className="d-inline-flex gap-3 align-items-center mt-3 justify-content-between" style={{fontSize: '0.9rem'}}>
          <div>
              <p className="fw-medium p-0 m-0">Name: <span className="fw-normal">{userData?.name}</span></p>
          </div>
          {
            ['staff,student'].includes(userData?.role) && 
            <div>
                <p className="fw-medium p-0 m-0">Matric No: <span className="fw-normal">{userData?.matricNo || 'Staff'}</span></p>
            </div>
          }
          <div>
              <p className="fw-medium p-0 m-0">Department: <span className="fw-normal">{userData?.department}</span></p>
          </div>
          <div>
              <p className="fw-medium p-0 m-0">Status: <span className="fw-normal">{userData?.verified ? 'Verified' : 'Not Verified'}</span></p>
          </div>
        </div>
      </div>
      <hr className="border border-1 w-100 border-secondary"/>
      <div className="row w-100">
        <div className="col">
          <input type="text" className="form-control shadow" name='name' placeholder={`${userData?.name || 'Full Name'}`} />
        </div>
        {
          userData?.role==='student' &&  
          <div className="col">
            <input type="text" className="form-control shadow" name='matricNo' placeholder={`${userData?.matricNo || "Matric No"}`} />
          </div>
        }
      </div>
      <div className="row w-100">
        <div className="col">
          <input type="text" className="form-control shadow" name='department' placeholder={`${userData?.department || "Department"}`} />
        </div>
        <div className="col">
          <input type="text" className="form-control shadow" name='mobileNumber' placeholder={`${userData?.mobileNumber || "Mobile Number"}`}   />
        </div>
      </div>
      <div className="row w-100">
      <div className="col">
          <input type="email" className="form-control shadow" name='email' placeholder={`${userData?.email || "Email Address"}`} />
      </div>
      </div>
      <UploadBox className='d-flex flex-column gap-2 align-items-center shadow' style={{cursor: 'pointer',width: '97%'}}>
        <IconWrapper className='text-center'>
            <FaFolderOpen />
        </IconWrapper>
        <label htmlFor="idCard" className='text-center my-2 pointer' style={{ fontSize: "16px", color: "#888888", marginTop: "10px" }}>
            Click To Upload ID Card
        </label>
        <input type="file" onChange={handleFileChange} name="idCard" id="idCard" accept='image/*' className="d-none"/>
      </UploadBox>
      <ProgressBar progress={uploadProgress} className="my-1 ms-4" style={{width: '90%'}} type='pill' />
      <SubmitButton loading={loading} className='btn btn-primary w-100 p-2 shadow rounded-pill' text={'Save'}/>
      </Container>
    </div>
  );
};

export default ProfilePage;
