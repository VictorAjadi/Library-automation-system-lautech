import React from 'react'
import { Link } from 'react-router-dom'

function LinkButton({to='.',text,style={},className=''}) {
    const location = window.location.pathname
  return (
    <Link to={to} state={{backUrl: location}} style={style} className={`${className}`}>
      {text}
    </Link>
  )
}

export default LinkButton