import React, { useState } from "react";
import styled from "styled-components";
import { FaCloudUploadAlt, FaFolderOpen } from "react-icons/fa";
import SubmitButton from './SubmitButton'
import CategorySelect from './CategorySelect'
import ProgressBar from './ProgressBar'
import toast from "react-hot-toast";
// Styled Components
const UploadContainer = styled.div`
  width: 100%;
  margin: auto;
`;

const UploadBox = styled.div`
  border: 2px dashed #d3d3d3;
  border-radius: 10px;
  padding: 40px;
  background-color: #f9f9f9;
  margin-bottom: 20px;
`;

const IconWrapper = styled.div`
  font-size: 48px;
  color: #4a90e2;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;


const UploadForm = ({action,loading,id}) => {
  const [uploadProgress, setUploadProgress] = useState(0);  
  const handleFileChange = async(e) => {
    const validatedImage = ["jpg", "jpeg", "png"];
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;
    const fileExtension = file.type.split("/")[1];
    if (!validatedImage.includes(fileExtension)) {
      return toast.error("Invalid image format, use jpg, jpeg, png");
    }
    if (name === "coverImg") {
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
    }
  };
  return (
    <div className="d-flex justify-content-center align-items-center">
      <UploadContainer className="text-center">
        <form id={id} onSubmit={(e)=> action(e)} encType="multipart/form-data">
            <UploadBox>
            <IconWrapper>
                <FaFolderOpen />
            </IconWrapper><span><p style={{ fontSize: "14px", color: "#888888" }}>File should be png, jpg, jpeg</p></span>
                <label htmlFor="coverImg" style={{ fontSize: "16px", color: "#888888", marginTop: "10px" }}>
                <h4>
                  <FaCloudUploadAlt /> Upload your files
                </h4>
                </label>
                <input type="file" name="coverImg" onChange={handleFileChange} id="coverImg" className="d-none" />
            </UploadBox>
            <ProgressBar type="pill" progress={uploadProgress} className="w-100 my-2"/>
            <InputContainer>
            <input type="text" className="form-control" name="title" placeholder="Book Title" />
            <input type="text" className="form-control" name="author" placeholder="Book Author" />
            <CategorySelect />
            <SubmitButton 
              className="btn btn-success p-2 rounded-2 shadow"
              loading={loading}
              text={'Submit'}
            />
            </InputContainer>
        </form>
      </UploadContainer>
    </div>
  );
};

export default UploadForm;
