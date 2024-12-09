import React from 'react'
import { useUserData } from '../hooks/store'
import useImage from '../hooks/useImage';
import CustomImage from './CustomImage';

function ProfileBox() {
 const userData = useUserData(state=>state.state);
 const avatar = useImage().avatar;
  return (
   <div className="w-100 mt-5 rounded-2 p-3 shadow text-center bg-secondary school-bg" style={{borderImage: 'fill 0 linear-gradient(#0001, #444)'}}>
    <div className='d-flex w-100 flex-column align-items-center'>
        <CustomImage src={userData?.profileImg?.url || avatar} className={'rounded-circle'} style={{width: '135px',height: '135px',filter: 'drop-shadow(7px 5px 7px black)'}}/>
    </div>
    <div className="d-inline-flex gap-3 align-items-center mt-3 justify-content-between" style={{fontSize: '0.9rem'}}>
      <div>
          <p className="fw-medium p-0 m-0">Name: <span className="fw-normal">{userData?.name}</span></p>
      </div>
      <div>
          <p className="fw-medium p-0 m-0">Matric No: <span className="fw-normal">{userData?.matricNo || 'Staff'}</span></p>
      </div>
      <div>
          <p className="fw-medium p-0 m-0">Department: <span className="fw-normal">{userData?.department}</span></p>
      </div>
      <div>
          <p className="fw-medium p-0 m-0">Status: <span className="fw-normal">{userData?.verified ? 'Verified' : 'Not Verified'}</span></p>
      </div>
    </div>
  </div>
  )
}

export default ProfileBox