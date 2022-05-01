import { oauth2Api } from '../oauth2Api';

const state = Math.random();
const scope = 'profile:read';

export const HomePage = () => {
  const { baseURL, client_id, redirect_uri } = oauth2Api._conf;

  return (
    <div>
      <h2>Home page</h2>

      <h3>We need permission to read your profile</h3>

      <div>
        <form method='get' action={baseURL + '/authorize'}>
          <input type='hidden' name='client_id'    value={client_id} />
          <input type='hidden' name='redirect_uri' value={redirect_uri} />
          <input type='hidden' name='scope'        value={scope} />
          <input type='hidden' name='state'        value={state} />
          <div>
            <button type='submit'>Start authorization process</button>
          </div>
        </form>
      </div>
    </div>
  );
}
