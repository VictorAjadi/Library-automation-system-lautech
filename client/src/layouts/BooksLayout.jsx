import React, { useState, useMemo } from 'react';
import ProfileBox from '../components/ProfileBox';
import BackButton from '../components/BackButton';
import Books from '../components/Books';
import { useSearchParams } from 'react-router-dom';

function BooksLayout({ type, actions, initialQuery='' }) {
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
        const res = await actions(query);
        setResponse({ count: res?.data?.count || 0, data: res?.data?.books || [] });
        setLoadingData(false);
    };
    fetchData();
  }, [query, actions]);
  return (
    <div className='w-100'>
     <div className='mb-3'><BackButton /></div> 
      <ProfileBox />
      <hr className="border border-1 w-100 border-secondary" />
      <Books loadingData={loadingData} type={type} data={response.data} count={response.count} />
    </div>
  );
}


export default BooksLayout;
