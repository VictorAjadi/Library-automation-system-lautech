import React from 'react'
import SearchBarWithSuggestion from './SearchBoxWithSuggestion'
import PaginationComponent from './PaginationComponent';
import ThreeColumnLayout from './ThreeColumnLayout';
import StudentInfo from './StudentInfo';
import StudentInfoSkeleton from '../skeletons/StudentInfoSkeleton';

function DeptComp({data,count,loadingData}) {
  const skeletons = Array(9).fill(null); // Use `null` as placeholder
  const calculate = Math.trunc(count*1)/10;
  const setTotalpages = calculate <= 1 ? 1 : Math.ceil(calculate);
  return (
    <ThreeColumnLayout
     FirstDivComp={<><SearchBarWithSuggestion/><br/></>}
     MiddleDivComp={
      <div className='w-100'>{
          loadingData?
          <>
              {skeletons.map((_, index) => (
                  <StudentInfoSkeleton key={index}/>
              ))}
          </>:
          <>
            {
                data.length > 0
                ?
                data.map((item,index)=>{
                    return (<StudentInfo key={index} data={item}/>)
                })
                :
                <div>
                    no result found
                </div>
            }
          </>
        }
      </div>
      }
     LastDivComp={<PaginationComponent totalPages={setTotalpages}/>}
    />
  )
}

export default DeptComp

