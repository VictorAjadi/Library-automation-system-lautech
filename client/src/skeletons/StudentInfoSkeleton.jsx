import React from 'react';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Container = styled.div`
   width: 100%;
  .card {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    display: flex;
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
    width: 100%;
  }
`;

const StudentInfoSkeleton = () => {
  return (
    <Container>
      <div className="card">
        {/* Profile Image Skeleton */}
        <Skeleton circle width={96} height={96} className="profile-img" />
        <div className="info-container">
          {/* Info Item Skeletons */}
          <div className="info">
            <Skeleton width={24} height={24} />
            <Skeleton width={150} />
          </div>
          <div className="info">
            <Skeleton width={24} height={24} />
            <Skeleton width={150} />
          </div>
          <div className="info">
            <Skeleton width={24} height={24} />
            <Skeleton width={150} />
          </div>
          <div className="info">
            <Skeleton width={24} height={24} />
            <Skeleton width={150} />
          </div>
          <div className="info">
            <Skeleton width={24} height={24} />
            <Skeleton width={150} />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default StudentInfoSkeleton;
