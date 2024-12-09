import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaArrowLeftLong } from "react-icons/fa6";
import { useThemeStore } from '../hooks/store';

function BackButton() {
  const theme = useThemeStore(state=>state.theme);
  const location = useLocation() 
  return (
    <div>
      <Link to={location.state?.backUrl || '..'} relative='path' className='rv-txdec position-fixed w-100 p-3' style={{backgroundColor: `${theme==='light' ? '#fff' : '#222'}`,zIndex: '100',top: '0'}}>
          <span className='pe-3'><FaArrowLeftLong /></span>
          <span>Back</span>
      </Link>
    </div>
  )
}

export default BackButton