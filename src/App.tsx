import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import EditorPage from './pages/EditorPage';
import PublicListPage from './pages/PublicListPage';
import MyLinksPage from './pages/MyLinksPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/l/:slug" element={<PublicListPage />} />
        <Route
          path="/edit/:listId"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-links"
          element={
            <ProtectedRoute>
              <MyLinksPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
