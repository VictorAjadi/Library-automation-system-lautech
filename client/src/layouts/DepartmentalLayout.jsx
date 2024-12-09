import React, { useState, useMemo } from 'react';
import ProfileBox from '../components/ProfileBox';
import BackButton from '../components/BackButton';
import { useSearchParams } from 'react-router-dom';
import { departmentalInfo } from '../utils/api';
import DeptComp from '../components/DeptComp';

function DepartmentalLayout({ initialQuery='' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [response, setResponse] = useState({ count: 0, data: [] });
  const [loadingData, setLoadingData] = useState(true);

  const query = useMemo(() => {
    const querys = searchParams.toString();
    if (!querys) return initialQuery; // If no query string, return just the initial query.
    return initialQuery
        ? `${initialQuery}&${querys}` // Append with `&` if initialQuery exists.
        : `?${querys}`;              // Start with `?` if no initialQuery.
}, [initialQuery, searchParams]);

  React.useEffect(() => {
    const fetchData = async () => {
        const res = await departmentalInfo(query);
        setResponse({ count: res?.data?.count || 0, data: res?.data?.users || [] });
        setLoadingData(false);
    };
    fetchData();
  }, [query]);

  return (
    <div className='w-100'>
     <div className='mb-3'><BackButton /></div> 
      <ProfileBox />
      <hr className="border border-1 w-100 border-secondary" />
      <DeptComp loadingData={loadingData} data={response.data} count={response.count} />
    </div>
  );
}


export default DepartmentalLayout;
