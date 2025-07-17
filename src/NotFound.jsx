import error from './assets/error.svg';
import {Link} from 'react-router-dom';


function NotFound({ nameRow, tax, tip, people }) {
    return (
        <>
        <h2>Page not found <img src={error}></img></h2>
        <Link to='/'>
            <button>Go Back</button>
        </Link>
        </>
    )
}

export default NotFound