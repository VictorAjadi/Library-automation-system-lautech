import React from 'react';
import styled from 'styled-components';
import { FaUser, FaIdBadge, FaPhone, FaEnvelope, FaBuilding } from 'react-icons/fa';
import CustomImage from './CustomImage';

const Container = styled.div`
  .card {
    background: inherit;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    display: flex;
    color: inherit;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
    }
  }

  .profile-img {
    border-radius: 50%;
    width: 6rem;
    height: 6rem;
    object-fit: cover;
  }

  .info-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;

    @media (min-width: 768px) {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
  }

  .info {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .icon {
      color: #6b7280; /* Tailwind's gray-500 */
    }

    .label {
      font-weight: bold;
      display: none;

      @media (max-width: 768px) {
        display: inline;
      }
    }

    .value {
      margin-left: 0.5rem;
    }
  }
`;

const StudentInfo = ({data,allowButtons=false,buttons}) => {
  return (
    <Container className='w-100'>
      <div className="card">
        <CustomImage src={data?.profileImg?.url} className='profile-img'/>
        <div className="info-container">
          <div className="info">
            <FaUser className="icon" />
            <span className="label">Name:</span>
            <span className="value">{data?.name}</span>
          </div>
          <div className="info">
            <FaIdBadge className="icon" />
            <span className="label">Matric No:</span>
            <span className="value">{data?.matricNo}</span>
          </div>
          <div className="info">
            <FaPhone className="icon" />
            <span className="label">Mobile No:</span>
            <span className="value">{data?.mobileNumber}</span>
          </div>
          <div className="info">
            <FaEnvelope className="icon" />
            <span className="label">Email:</span>
            <span className="value">{data?.email}</span>
          </div>
          <div className="info">
            <FaBuilding className="icon" />
            <span className="label">Department:</span>
            <span className="value">{data?.department}</span>
          </div>
        </div>
      </div>
      <div className='my-2'>
        {
          allowButtons && 
          buttons
        }
      </div>
    </Container>
  );
};

export default StudentInfo;
