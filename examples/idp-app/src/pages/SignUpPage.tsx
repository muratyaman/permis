import { FC, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Form, Input, PageHeader, Row } from 'antd';
import { idpApi } from '../idpApi';
import { UserContext } from '../contexts/UserContext';

export const SignUpPage: FC = () => {
  const { url = '' } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { user, setUser } = useContext(UserContext);
  const loggedIn = !!user; // TODO: use error, logged in already
  console.log({ loggedIn });

  const onFinish = async (values: any) => {
    setError('');
    const out = await idpApi.signUp(values);
    if (out.error) {
      setError(out.error);
    } else {
      if (out.data) {
        const { user_id, username, token } = out.data;
        if (setUser) setUser({ user_id, username, token });
        if (url) navigate(url); else navigate('/');
      } else {
        setError('Failed to sign up');
      }
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div>
      <PageHeader
        className='site-page-header'
        onBack={() => window.history.back()}
        title='Sign Up'
        subTitle='Please register'
      />

      <div>&nbsp;</div>

      <Row>
        <Col span={8} />
        <Col span={8}>

          {!!error && <div>Error: {error}</div>}

          <Form
            name='basic'
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
          >
            <Form.Item
              label='Username'
              name='username'
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label='Password'
              name='password'
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label='Confirm'
              name='password_confirm'
              rules={[{ required: true, message: 'Please confirm your password!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type='primary' htmlType='submit'>
                Submit
              </Button>
            </Form.Item>
          </Form>

        </Col>
        <Col span={8} />
      </Row>

    </div>
  );
}
