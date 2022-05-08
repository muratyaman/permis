import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { oauth2Api } from '../oauth2Api';

const grant_type = 'authorization_code';
const scope = 'profile:read';

export const AuthFinishPage = () => {
  const { client_id, redirect_uri } = oauth2Api._conf;

  const navigate = useNavigate();
  const { code = '', error = '' } = useParams();
  console.log({ code, error });

  useEffect(() => {
    async function load() {
      if (code) {
        const res = await oauth2Api.tokenCreate({ grant_type, code, client_id, redirect_uri, scope });
        if (res.token) {
          api._setToken(res.token);
          navigate('/');
        } else {
          // show error
        }
      }
    }
    load();
  }, [navigate, code, client_id, redirect_uri]);

  return (
    <div>

      <h2>Auth page</h2>

      <p>Loading...</p>

      {!!error && <p>Error: {error}</p>}

    </div>
  );
}
