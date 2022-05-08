import { Link } from 'react-router-dom';

export const HomePage = () => {

  return (
    <div>
      <h2>Home page</h2>

      <h3>This is a demo client app</h3>

      <Link to="auth/start">Go to Authorization</Link>
    </div>
  );
}
