import React from 'react';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Container = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f5f6fa;
`;

const Card = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
  margin-bottom: 20px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 10px;
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Stat = styled.div`
  text-align: center;
  flex: 1;
`;

const Chart = styled.div`
  border-top: 1px solid #e0e0e0;
  padding-top: 10px;
`;

const OverviewSkeleton = () => {
  return (
    <Container>
      <Card>
        <Header>
          <h1>
            <Skeleton width={150} />
          </h1>
          <Tabs>
            <Skeleton width={100} height={25} style={{ marginRight: '10px' }} />
            <Skeleton width={100} height={25} style={{ marginRight: '10px' }} />
            <Skeleton width={100} height={25} style={{ marginRight: '10px' }} />
            <Skeleton width={100} height={25} />
          </Tabs>
        </Header>
        <Stats>
          {[...Array(2)].map((_, idx) => (
            <Stat key={idx}>
              <Skeleton circle width={40} height={40} />
              <p>
                <Skeleton width={80} />
              </p>
              <h2>
                <Skeleton width={50} />
              </h2>
            </Stat>
          ))}
        </Stats>
        <Chart>
          <h2>
            <Skeleton width={120} />
          </h2>
          <p>
            <Skeleton width={80} />
          </p>
          <h2>
            <Skeleton width={60} />
          </h2>
          <Skeleton height={200} />
        </Chart>
      </Card>
    </Container>
  );
};

export default OverviewSkeleton;
