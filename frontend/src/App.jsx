import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import EntryList from './pages/EntryList';
import EntryEditor from './pages/EntryEditor';
import EntryDetail from './pages/EntryDetail';
import CalendarView from './pages/CalendarView';
import Login from './pages/Login';
import Register from './pages/Register';
import SharePage from './pages/SharePage';
import TagsPage from './pages/TagsPage';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/share/:id" element={<SharePage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="entries" element={<EntryList />} />
          <Route path="entries/new" element={<EntryEditor />} />
          <Route path="entries/:id" element={<EntryDetail />} />
          <Route path="entries/:id/edit" element={<EntryEditor />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
