import { Layout } from 'antd';
import { Route, Routes } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { UnknownPage } from './pages/UnknownPage';

const { Header, Footer, Content } = Layout;

function App() {
  return (
    <Layout>
      <Header>My IdP App</Header>
      <Content>
        <Routes>
          <Route path='/authorize' element={<AuthPage />} />
          <Route path='/sign-up'   element={<SignUpPage />} />
          <Route path='/sign-in'   element={<SignInPage />} />
          <Route path='/'          element={<HomePage />} />
          <Route path='*'          element={<UnknownPage />} />
        </Routes>
      </Content>
      <Footer>
        My IdP App &copy; 2022
      </Footer>
    </Layout>
  );
}

export default App;
