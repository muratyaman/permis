import { FC } from 'react';
import { Card, Col, Row, PageHeader } from 'antd';
import { Link } from 'react-router-dom';

const { Meta } = Card;

export const HomePage: FC = () => {
  return (
    <div>
      
      <PageHeader
        className='site-page-header'
        onBack={() => window.history.back()}
        title='Home page'
        subTitle='Welcome to My IdP App'
      />

      <Row>
        <Col span={1} />
        <Col span={22}>
          <Card
            hoverable
            style={{ width: 300 }}
            cover={<img alt="https://unsplash.com/photos/MjdMKvEEuqo" src="/images/vadim-bogulov-MjdMKvEEuqo-unsplash.jpg" />}
          >
            <Meta title="Please sign up or sign in" description={
              <>
                <Link to='sign-up'>Sign Up</Link>&nbsp;
                <Link to='sign-in'>Sign In</Link>
              </>
            } />
          </Card>
          <Col span={1} />
        </Col>
      </Row>

    </div>
  );
}
