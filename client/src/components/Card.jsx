import React from 'react';
import { Card } from 'react-bootstrap';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { encodeImageToBlurhash } from '../utils/blurhash';
import CustomImage from './CustomImage';

const CardComponent = ({ 
  title, 
  description, 
  imageUrl, 
  Button1, 
  Button2, 
  showButton1 = false, 
  showButton2 = false,
  showBarcode = false, 
  barcodeUrl=''
}) => {
  return (
    <Card style={{ width: '18rem' }} className='shadow p-0'>
      {/* Lazy Load Image with Blurhash Fallback */}
      <LazyLoadImage 
        src={imageUrl} 
        alt={title || 'not available'}
        className='rounded-2'
        style={{ width: '100%',maxHeight: '250px'}} 
        effect="blur" 
        placeholderSrc={async()=> await encodeImageToBlurhash(imageUrl)}
      />
      <Card.Body>
        <h5 className='bg-secondary rounded-pill p-2 text-capitalize'>{title}</h5>
        <div>{description}</div>
        {showBarcode && <CustomImage src={barcodeUrl} className='rounded-2 shadow w-auto'/>}
        {/* First Button */}
        {showButton1 && Button1}
        <br />
        {/* Second Button - Only show if `showButton2` is true */}
        {showButton2 && Button2}
      </Card.Body>
    </Card>
  );
};

export default React.memo(CardComponent);
