import React from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css';
import { encodeImageToBlurhash } from '../utils/blurhash';

function CustomImage({src,title='not available',className='',style={}}) {
  return (
    <LazyLoadImage 
        src={src} 
        alt={title}
        className={className}
        style={style}
        effect="blur" 
        placeholderSrc={async()=> await encodeImageToBlurhash(src)}
    />
  )
}

export default CustomImage