import { Route, Routes } from 'react-router-dom';
import { AuthCompletePage } from './pages/AuthCompletePage';
import { HomePage } from './pages/HomePage';
import { UnknownPage } from './pages/UnknownPage';

function App() {

  return (
    <div>
      <Routes>
        <Route path='/auth' element={<AuthCompletePage />} />
        <Route path='/'     element={<HomePage />} />
        <Route path='*'     element={<UnknownPage />} />
      </Routes>
    </div>
  );
}

export default App;
