import { Route, Routes } from 'react-router-dom';
import { AuthFinishPage } from './pages/AuthFinishPage';
import { AuthStartPage } from './pages/AuthStartPage';
import { HomePage } from './pages/HomePage';
import { UnknownPage } from './pages/UnknownPage';

function App() {

  return (
    <div>
      <Routes>
        <Route path='/auth/start'  element={<AuthStartPage />} />
        <Route path='/auth/finish' element={<AuthFinishPage />} />
        <Route path='/'            element={<HomePage />} />
        <Route path='*'            element={<UnknownPage />} />
      </Routes>
    </div>
  );
}

export default App;
