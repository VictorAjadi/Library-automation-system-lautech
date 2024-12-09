import React from 'react'

function SubmitButton({type='submit',loading='idle',text,className='',style={},action=null}) {
  return (
   <button type={type} onClick={action && action} disabled={loading==='submitting'} className={`${loading==='idle' ? `${className}` : 'rounded-2 p-2 shadow bg-secondary w-100'} border-0`} style={style}>{text}</button>
  )
}

export default React.memo(SubmitButton)