import {useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Html5QrcodeScanner } from "html5-qrcode";
import "../styles/Barcode.css"
import { checkInUserAccount, checkOutUserAccount, returnBook, verifyUserAccount } from '../utils/api';
import BackButton from '../components/BackButton';
function QRCodeReader({type}) {
  const [render,setRender] = useState(true)
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: {
        width: 250,
        height: 250 
      }
    });
    const success = async (result) => {
      const getID = result.split(':');
      scanner.clear();
      const load = toast.loading('scanning...');
      const response = type === 'check-in' 
      ? await checkInUserAccount(getID[0]) : type === 'verify'
      ? await verifyUserAccount(getID[0]) : type === 'check-out'
      ? await checkOutUserAccount(getID[0]): await returnBook(getID[1],getID[0]) 
      toast.remove(load);
      if(response.status === 'success'){
          toast.success(response.message);
      }else{
          toast.error(response.message);
      }
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner.");
      });
      setRender(prev=>!prev);
    };
    scanner.render(success);
    // cleanup function when component will unmount
    return () => {
      scanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ");
      });
  };

  }, [type,render]);

  return (
    <>
      <div className='my-2'>
        <BackButton/>  
      </div>
      <div className='adjust-scanner add-vh'>   
        <div id="reader"></div> {/* Render unconditionally */}
      </div>
    </>
  );
}

export default QRCodeReader;
