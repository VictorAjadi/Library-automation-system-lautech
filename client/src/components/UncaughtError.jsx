import React from 'react'
import { NavLink, useRouteError } from 'react-router-dom'

function UncaughtError() {
 const error=useRouteError();
  return (
    <div className='d-flex align-item-center justify-content-between flex-column gap-5'>
      <div className={`bg-transparent d-flex flex-column my-5 py-5`}>
          <div className='rounded-3 d-flex justify-content-center align-items-center bg-secondary p-4 mx-auto mt-5 mb-4 shadow-lg'>
            <div>
              <p className='fw-bold text-warning fs-3 text-wrap'>{error.message || 'An error occured try again in few momment time.'}...!!</p>
              <pre className='fs-4'><span className='text-danger'>{error.statusCode || 404}</span> - {error.status || 'error'}</pre>
            </div>
          </div>
          <NavLink to={'..'} id='link' className={'text-light py-2 px-4 rounded shadow border-0 mx-auto bg-warning bg-gradient mt-5 fw-medium'}>Return Back To Previous Page</NavLink>
      </div>
     </div>
  )
}

export default UncaughtError