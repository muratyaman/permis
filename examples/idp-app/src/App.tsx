import { Layout } from 'antd';
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { IUser, UserContextProvider } from './contexts/UserContext';
import { AuthorizePage } from './pages/AuthorizePage';
import { HomePage } from './pages/HomePage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { UnknownPage } from './pages/UnknownPage';

const { Header, Footer, Content } = Layout;

function App() {
  const [user, setUser] = useState<IUser|null>(null);
  const userCtxData = { user, setUser };
  return (
    <UserContextProvider value={userCtxData}>
      <Layout>
        <Header>My IdP App</Header>
        <Content>
          <Routes>
            <Route path='/authorize' element={<AuthorizePage />} />
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
    </UserContextProvider>
  );
}

export default App;
