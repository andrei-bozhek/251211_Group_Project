import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container page-stack">
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link className="button" to="/">Go home</Link>
    </div>
  );
};

export default NotFound;
