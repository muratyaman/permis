import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Form, Input, PageHeader, Row } from 'antd';
import { api } from '../api';

export const SignUpPage: FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const onFinish = async (values: any) => {
    setError('');
    const out = await api.signUp(values);
    if (out.error) {
      setError(out.error);
    } else {
      if (out.data) {
        navigate('/');
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
