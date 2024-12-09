import React from 'react';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonCard = styled.div`
  width: 15rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const SkeletonImage = styled.div`
  width: 100%;
  height: 150px;
    border-radius: 8px;
  background-color: #e0e0e0;
`;

const SkeletonBody = styled.div`
  padding: 12px;
`;

const SkeletonButton = styled.div`
  width: 48%;
  display: inline-block;
  margin: 5px 2%;
`;

const CardSkeleton = () => {
  return (
    <SkeletonCard>
      {/* Image Skeleton */}
      <SkeletonImage className='mt-2'>
        <Skeleton height="100%" width="100%" />
      </SkeletonImage>

      {/* Content Skeleton */}
      <SkeletonBody>
        {/* Title */}
        <Skeleton height={22} width="70%" />
        {/* Description */}
        <Skeleton height={16} count={2} style={{ marginTop: 8 }} />
        {/* Buttons */}
        <div style={{ marginTop: 8 }}>
          <SkeletonButton>
            <Skeleton height={24} width="100%" />
          </SkeletonButton>
          <SkeletonButton>
            <Skeleton height={24} width="100%" />
          </SkeletonButton>
        </div>
      </SkeletonBody>
    </SkeletonCard>
  );
};

export default React.memo(CardSkeleton);
