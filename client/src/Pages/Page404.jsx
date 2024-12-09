import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/page404.css'
function Page404() {
	React.useEffect(() => {
		document.body.classList.add('normal-theme');
		
		// Optional: Cleanup if needed
		return () => {
		  document.body.classList.remove('normal-theme');
		};
	  }, []);
	  
  return (
	<div id="notfound">
		<div className="notfound">
			<div className="notfound-404">
				<h1>:(</h1>
			</div>
			<h2>404 - Page not found</h2>
			<p>The page you are looking for might have been removed had its name changed or is temporarily unavailable.</p>
			<Link to="/">home page</Link>
		</div>
	</div>
  )
}

export default Page404