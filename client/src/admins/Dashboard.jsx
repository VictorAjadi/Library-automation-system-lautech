import React, { useState } from 'react';
import styled from 'styled-components';
import {  FaChevronDown, FaChevronUp, FaBook, FaUsers } from 'react-icons/fa';
import Accordion from 'react-bootstrap/Accordion';
import {NavLink, useSearchParams} from 'react-router-dom'
import SearchBarWithSuggestion from '../components/SearchBoxWithSuggestion';
import PaginationComponent from '../components/PaginationComponent';
import { getAllUser, suspendUserAccount, unsuspendUserAccount } from '../utils/api';
import ThreeColumnLayout from '../components/ThreeColumnLayout';
import BackButton from '../components/BackButton'
import StudentInfo from '../components/StudentInfo';
import SubmitButton from '../components/SubmitButton'
import toast from 'react-hot-toast';
import OverviewSkeleton from '../skeletons/OverviewSkeleton';
import BarChart from '../components/BarChart';
import LineGraph from '../components/LineGraph';

function Dashboard({}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [response, setResponse] = useState({ count: 0, data: {} });
  const [loadingData, setLoadingData] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
        const querys = searchParams.toString();
        const res = await getAllUser(querys);
        setResponse({ count: res?.data?.count, data: res?.data });
        setLoadingData(false);
    };
    fetchData();
  }, [searchParams]);

  console.log(response)
  const calculate = Math.trunc(response.count*1)/10;
  const setTotalpages = calculate <= 1 ? 1 : Math.ceil(calculate);

  return (
     <>
        <BackButton />
        <div className='mt-5'>
          <ThreeColumnLayout 
            FirstDivComp = {<SearchBarWithSuggestion />}
            MiddleDivComp = {
            <>
             {
              response?.data?.aggregate?.length > 0 ?
              <BarChart 
                data={{
                  labels: response?.data?.aggregate.map(each=>each?.title),
                  datasets: [
                    {
                      label: "Title",
                      data: response?.data?.aggregate.map(each=>each?.total),
                      backgroundColor: "blue"
                    }
                  ]
                }}
                title='Top 10 Most Read Books'
                style={{ width: "50%", height: "400px" }}
                xAxisTitle='Books Title'
                yAxisTitle='Number of books read'
              />
              : <div>
                data not found for top 10 most read books
              </div>
             }
             {
              loadingData ? 
              <OverviewSkeleton/>
              :<Overview
                data={response?.data?.unsuspendedUsers}
                userCount={response?.data?.unsuspendedUsers.length}
                bookCount={response?.data?.bookCount}
                aggregate={response?.data?.aggregateUsers}
                title='Unsuspended Users'
                allowAccordion={true}
                type={'unsuspend'}
               />
             }
            {
              loadingData ? 
              <OverviewSkeleton/>
              :<Overview
                data={response?.data?.suspendedUsers}
                userCount={response?.data?.suspendedUsers.length}
                bookCount={response?.data?.bookCount}
                aggregate={response?.data?.aggregateUsers}
                title='Suspended Users'
                allowAccordion={true}
                type={'suspend'}
               />
             }
            </>
            }
            LastDivComp={<PaginationComponent totalPages={setTotalpages}/>}
          />
        </div>
     </>
    )
}

export default Dashboard


const Container = styled.div`
  padding: 20px;
  width: 100%;
  font-family: Arial, sans-serif;
  background-color: inherit;
  color: inherit;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;

const Card = styled.div`
  background-color: inherit;
  color: inherit;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
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
  color: inherit;

  h1 {
    font-size: 18px;
    margin: 0;
    color: inherit;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 10px;

  a {
    text-decoration: none;
    color: inherit;
    padding: 5px 10px;
    border-radius: 4px;
  }
  a:hover{
     background-color: #222;
     color: #fff;
  }
  
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Stat = styled.div`
  text-align: center;
  flex: 1;

  i {
    font-size: 24px;
    color: #6c757d;
  }

  p {
    margin: 5px 0;
    font-size: 14px;
    color: #6c757d;
  }

  h2 {
    margin: 0;
    font-size: 24px;
  }
`;

const Chart = styled.div`
  border-top: 1px solid #e0e0e0;
  padding-top: 10px;
  div {
    width: 100%;
    display: ${({ show }) => (show==='true' ? 'block' : 'none')};
  }
`;

const Toggler = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  cursor: pointer;

  i {
    font-size: 18px;
    color: #6c757d;
  }
`;

export const Overview = ({title='Overview',aggregate,allowAccordion=false,data,type,userCount=0,bookCount=0}) => {
  const [showChart, setShowChart] = useState(false);
  const [loading,setLoading]=useState('idle')
  const toggleChart = () => {
    setShowChart((prev) => !prev);
  };
  const handleUnSuspension = async (id) => {
    setLoading('submitting');
    const load = toast.loading('Processing...');
    const res = await unsuspendUserAccount(id)
    setLoading('idle');
    toast.remove(load);
    if(res.status === 'success'){
        toast.success(res.message);
    }else{
        toast.error(res.message);
    }
    return;
  };
  const handleSuspension = async (id) => {
    setLoading('submitting');
    const load = toast.loading('Processing...');
    const res = await suspendUserAccount(id)
    setLoading('idle');
    toast.remove(load);
    if(res.status === 'success'){
        toast.success(res.message);
    }else{
        toast.error(res.message);
    }
    return;
  };
  return (
    <>
      {
        data.length>0 &&
        <Container className='rounded-2 border border-1 border-white my-2'>
        <Card className='border border-1 border-white'>
          <Header>
            <h1>{title}</h1>
{/*             <Tabs>
              <button  to={'#1'} className={({isActive})=> `${isActive && 'bg-secondary text-light'}`}>Last 7 days</button>
              <button  to={'#1'} className={({isActive})=> `${isActive && 'bg-secondary text-light'}`}>Last 7 days</button>
              <button  to={'#1'} className={({isActive})=> `${isActive && 'bg-secondary text-light'}`}>Last 7 days</button>
              <button  to={'#1'} className={({isActive})=> `${isActive && 'bg-secondary text-light'}`}>Last 12 months</button>
            </Tabs> */}
          </Header>
          <Stats>
            <Stat>
              <FaUsers />
              <p>Total {type} users</p>
              <h2>{userCount}</h2>
            </Stat>
            <Stat>
              <FaBook />
              <p>Total Uploaded Books</p>
              <h2>{bookCount}</h2>
            </Stat>
          </Stats>
          <Chart show={`${showChart}`}>
            <div>
              {
                aggregate.length>0 ?
                <BarChart
                data={{
                  labels: aggregate.map(each=>each?.month),
                  datasets: [
                    {
                      label: `${type.toLowerCase()} user monthly data`,
                      data: aggregate.map(each=>type==='unsuspend'?each?.unsuspendedCount:each?.suspendedCount),
                      backgroundColor: "green"
                    }
                  ]
                }}
                title='User Monthly Data'
                style={{ width: "50%", height: "100%" }}
                xAxisTitle='Month'
                yAxisTitle={`Number of ${type.toLowerCase()} users`}
              />:<h3>Data not available</h3>
              }
            </div>
          </Chart>
          <Toggler onClick={toggleChart}>
            {showChart ? <FaChevronUp /> : <FaChevronDown />}
          </Toggler>
        </Card>
        {
          allowAccordion && 
          <Accordion >
          <Accordion.Item eventKey="0">
            <Accordion.Header>Student Information</Accordion.Header>
            <Accordion.Body>
              {
                data.length>0 &&
                data.map((each,index)=>(<StudentInfo key={index} buttons={
                  <>
                    {
                      type==='unsuspend' ?
                      <SubmitButton action={()=>handleSuspension(each?._id)} className="btn btn-primary rounded-2 w-100 shadow" loading={loading} text={loading==='idle'?'suspend':'Processing...'}/>
                      : type === 'suspend' ?
                      <SubmitButton action={()=>handleUnSuspension(each?._id)} className="btn btn-primary rounded-2 w-100 shadow" loading={loading} text={loading==='idle'?'unsuspend':'Processing...'}/>
                      : <></>
                    }
                  </>
                } allowButtons={true} data={each}/>))    
              }
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        }
  
      </Container>
      }
    </>
  );
};


