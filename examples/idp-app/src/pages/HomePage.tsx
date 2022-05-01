import { FC, useContext } from 'react';
import { Card, Col, Row, PageHeader } from 'antd';
import { Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

const { Meta } = Card;

export const HomePage: FC = () => {
  const { user } = useContext(UserContext);
  const loggedIn = !!user;
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
          <Card
            hoverable
            style={{ width: 300 }}
            cover={<img alt="https://unsplash.com/photos/MjdMKvEEuqo" src="/images/vadim-bogulov-MjdMKvEEuqo-unsplash.jpg" />}
          >
            {!loggedIn && (
              <Meta title="Please sign up or sign in" description={
                <>
                  <Link to='sign-up'>Sign Up</Link>&nbsp;
                  <Link to='sign-in'>Sign In</Link>
                </>
              } />
            )}
            {loggedIn && (
              <Meta title="Enjoy your visit" description={
                <p>
                  Lorem ipsum...
                </p>
              } />
            )}
          </Card>
          <Col span={1} />
        </Col>
      </Row>

    </div>
  );
}
