import React, { useState } from 'react'
import SearchBarWithSuggestion from './SearchBoxWithSuggestion'
import { bookSuggestStore } from '../hooks/store'
import Card from './Card';
import CardSkeleton from '../skeletons/CardSkeleton'
import { borrowBook, completeBook, editBook, readBook } from '../utils/api';
import toast from 'react-hot-toast';
import CustomImage from './CustomImage';
import ModalButton from './ModalButton';
import UploadForm from './UploadForm';
import PaginationComponent from './PaginationComponent';
import ThreeColumnLayout from './ThreeColumnLayout';

function Books({type,data,count,loadingData}) {
  const bookSuggestData = bookSuggestStore(state=> state.state);
  const [loading,setLoading]=useState('idle')
  const skeletons = Array(9).fill(null); // Use `null` as placeholder
  const handleComplete = async (event) => {
    event.preventDefault(); // Prevent default form submission
    const {id} = event.target; // Get the email value from the form
    setLoading('submitting');
    const load = toast.loading('Processing...');
    const response = await completeBook(id)
    setLoading('idle');
    toast.remove(load);
    if(response.status === 'success'){
        toast.success(response.message);
    }else{
        toast.error(response.message);
    }
    return;
  };
  const handleRead = async (event) => {
    event.preventDefault(); // Prevent default form submission
    const {id} = event.target; // Get the email value from the form
    setLoading('submitting');
    const load = toast.loading('Processing...');
    const response = await readBook(id)
    setLoading('idle');
    toast.remove(load);
    if(response.status === 'success'){
        toast.success(response.message);
    }else{
        toast.error(response.message);
    }
    return;
  };
  const handleBorrow = async (event) => {
    event.preventDefault(); // Prevent default form submission
    const {id} = event.target; // Get the email value from the form
    setLoading('submitting');
    const load = toast.loading('Processing...');
    const response = await borrowBook(id)
    setLoading('idle');
    toast.remove(load);
    if(response.status === 'success'){
        toast.success(response.message);
    }else{
        toast.error(response.message);
    }
    return;
  };
  const handleEdit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    const {id} = event.target; // Get the email value from the form
    const form = event.target;
    const formData = new FormData(form)
    setLoading('submitting');
    const load = toast.loading('Processing...');
    const response = await editBook(id,formData)
    setLoading('idle');
    toast.remove(load);
    if(response.status === 'success'){
        toast.success(response.message);
    }else{
        toast.error(response.message);
    }
    return;
  };
  const calculate = Math.trunc(count*1)/10;
  const setTotalpages = calculate <= 1 ? 1 : Math.ceil(calculate);
  return (
    <ThreeColumnLayout
     FirstDivComp={<><SearchBarWithSuggestion searchData={bookSuggestData}/><br/></>}
     MiddleDivComp={
      <div className='container'>
        <div className='row gap-3 justify-content-evenly'> 
          {
          loadingData ? 
          <>
            {skeletons.map((_, index) => (
                <CardSkeleton  key={index}/>
            ))}
          </>:
          <>
           {
            data.length > 0 ?
            data.map((item,index)=>{
                return (
                  type === 'borrow' ?
                    <Card
                    key={index}
                    imageUrl={item?.book?.coverImg?.url}
                    title={item?.book?.category}
                    description={
                        <div>
                            <h5 className='text-capitalize fw-bold'>{item?.book?.title?.toLowerCase()}</h5>
                            <h6 className='text-capitalize my-1'>By {item?.book?.author?.toLowerCase()}</h6>
                            <p className='text-capitalize fw-medium rounded-pill shadow p-2 my-2 bg-secondary'>{item?.status}</p>
                        </div>
                    } 
                    showBarcode={true}
                    barcodeUrl={item?.barcode}
                  />:type === 'read'?
                  <Card
                  key={index}
                    imageUrl={item?.book?.coverImg?.url}
                    title={item?.book?.category}
                    description={
                        <div>
                            <h5 className='text-capitalize fw-bold'>{item?.book?.title?.toLowerCase()}</h5>
                            <h6 className='text-capitalize my-1'>By {item?.book?.author?.toLowerCase()}</h6>
                        </div>
                    } 
                    showButton1={true}
                    Button1={
                        <button onClick={handleComplete} disabled={item.status==='COMPLETED' || loading==='submitting'} id={item?._id} className={`border-0 btn ${loading==='idle'? 'btn-info':'btn btn-secondary'} w-100 my-2 p-2`}>{item.status==='COMPLETED'?'Completed':loading==='submitting'?'Processing':'Complete Reading'}</button>
                    }
                />: type === 'all'?
                  <Card
                  key={index}
                    imageUrl={item?.coverImg?.url}
                    title={item?.category}
                    description={
                        <div>
                            <h5 className='text-capitalize fw-bold'>{item?.title?.toLowerCase()}</h5>
                            <h6 className='text-capitalize my-1'>By {item?.author?.toLowerCase()}</h6>
                        </div>
                    } 
                    showButton1={true}
                    showButton2={true}
                    Button1={
                        <button onClick={handleRead} disabled={loading==='submitting'} id={item?._id} className={`border-0 btn ${loading==='idle'? 'btn-primary':'btn btn-secondary'} my-2 p-2 w-100`}>{loading==='submitting'?'Processing':'Read'}</button>
                    }
                    Button2={
                        <button onClick={handleBorrow} disabled={loading==='submitting'} id={item?._id} className={`border-0 btn ${loading==='idle'? 'btn-warning':'btn btn-secondary'} my-2 p-2 w-100`}>{loading==='submitting'?'Processing':'Borrow'}</button>
                    }
                />: type==='edit'?
                  <Card
                  key={index}
                    imageUrl={item?.coverImg?.url}
                    title={item?.category}
                    description={
                        <div>
                            <h5 className='text-capitalize fw-bold'>{item?.title}</h5>
                            <h6 className='text-capitalize my-1'>By {item?.author}</h6>
                        </div>
                    } 
                    showButton1={true}
                    Button1={
                        <ModalButton
                          buttonText='Edit'
                          buttonClassname='btn btn-warning p-2 rounded-2 shadow w-100'
                          title={'Edit Book'}
                          children={
                            <UploadForm action={handleEdit} id={item?._id} loading={loading}/>
                          }
                        />
                    }
                />
                :<Card
                key={index}
                    imageUrl={item?.book?.coverImg?.url}
                    title={item?.book?.category}
                    description={
                        <div>
                            <div className='d-inline-flex gap-2 align-items-center'>
                              <CustomImage src={item?.student?.profileImg?.url} className='rounded-circle shadow' style={{float: 'left',width: '50px',height: '50px',shapeOutside: 'circle(50%)'}}/>
                              <div>
                                  <h5 className='text-capitalize fw-bold'>{item?.book?.title?.toLowerCase()}</h5>
                                  <h6 className='text-capitalize my-1 text-start'>By: {item?.book?.author?.toLowerCase()}</h6>
                                  <h6 className='text-capitalize my-1 text-start'>Name: {item?.student?.name?.toLowerCase()}</h6>
                              </div>
                            </div>
                        </div>
                    } 
                />
                )
            }):
            <div>
                no result found
            </div>
           }
          </>
        }
      </div>
      </div>
      }
     LastDivComp={<PaginationComponent totalPages={setTotalpages}/>}
    />
  )
}

export default Books

