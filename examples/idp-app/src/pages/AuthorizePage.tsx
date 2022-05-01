import { FC, useContext, useEffect, useState } from 'react';
import { Col, Row, PageHeader } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { oauth2Api } from '../oauth2Api';

export const AuthorizePage: FC = () => {
  const { client_id = '', scope = 'profile', state = '', redirect_uri = '', consent_id = '' } = useParams();
  const [consumer_name, setConsumerName] = useState('');
  const [client_name, setClientName] = useState('');
  const [is_granted, setIsGranted] = useState(0);
  const [isSubmitted, setSubmitted] = useState(0);
  const [error, setError] = useState('');
  const { user } = useContext(UserContext);
  const loggedIn = !!user;

  useEffect(() => {
    async function load() {
      const consentParams = { client_id, redirect_uri, scope, state };
      const res = await oauth2Api.consentRetrieve(consent_id, consentParams);
      if (res.data) {
        setConsumerName(res.data.consumer.name);
        setClientName(res.data.client.name);
      }
    }
    load();
  }, [consent_id, client_id, redirect_uri, scope, state]);

  const returnUrl = new URL('/authorize');
  returnUrl.searchParams.append('client_id',    client_id);
  returnUrl.searchParams.append('scope',        scope);
  returnUrl.searchParams.append('state',        state);
  returnUrl.searchParams.append('redirect_uri', redirect_uri);
  returnUrl.searchParams.append('consent_id',   consent_id);
  const returnUrlStr = returnUrl.toString();

  const deny = async () => {
    setIsGranted(0);
    setError('');
  };

  const allow = async () => {
    setIsGranted(1);
    setError('');
    const consentData = { client_id, redirect_uri, scope, state, is_granted: 1 };
    const res = await oauth2Api.consentUpdate(consent_id, consentData, user?.token ?? '');
    console.log('consent update', res);
    if (res.data) setSubmitted(1);
  };

  return (
    <div>
      
      <PageHeader
        className='site-page-header'
        onBack={() => window.history.back()}
        title='Home page'
        subTitle={`Welcome ${user?.username ?? ''}`}
      />

      <Row>
        <Col span={1} />
        <Col span={22}>

          {!loggedIn && (
            <div>
              <p>App "{client_name}" by "{consumer_name}" is asking your permission</p>
              <p>Please <Link to={`sign-up?url=${returnUrlStr}`}>Sign Up</Link> or <Link to={`sign-in?return=${returnUrlStr}`}>Sign In</Link></p>
            </div>
          )}

          {loggedIn && user && (
            <div>
              <p>Do you allow App "{client_name}" by "{consumer_name}" to do the following?</p>
              <p>* read profile</p>

              {!isSubmitted && (
                <div>
                  <button type='button' onClick={deny}>Deny</button>&nbsp;
                  <button type='button' onClick={allow}>Allow</button>
                </div>
              )}

              {!!error && (<div>Error: {error}</div>)}

              {isSubmitted && (
                <form method='post' action={oauth2Api._baseURL + '/authorize'}>
                  <input type='hidden' name='client_id'    value={client_id} />
                  <input type='hidden' name='redirect_uri' value={redirect_uri} />
                  <input type='hidden' name='scope'        value={scope} />
                  <input type='hidden' name='state'        value={state} />
                  <input type='hidden' name='consent_id'   value={consent_id} />
                  <div>
                    <button type='submit'>Continue</button>
                  </div>
                </form>
              )}
            </div>
          )}

        </Col>
        <Col span={1} />
      </Row>

    </div>
  );
}
