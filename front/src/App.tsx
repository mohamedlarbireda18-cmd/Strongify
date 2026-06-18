import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { LoginForm } from './components/auth/LoginForm';
import { SignInForm } from './components/auth/SignInForm';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Exercises } from './pages/Exercises';
import { MyWorkouts } from './pages/MyWorkouts';
import { WorkoutDetail } from './pages/WorkoutDetail';
import { SessionPage } from './pages/SessionPage';
import { BodyTracker } from './pages/BodyTracker';
import { Profile } from './pages/Profile';
import { SessionDetailPage } from './pages/SessionDetail';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signin" element={<SignInForm />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/my-workouts" element={<MyWorkouts />} />
          <Route path="/my-workouts/:id" element={<WorkoutDetail />} />
          <Route path="/my-workouts/:id/session" element={<SessionPage />} />
          <Route path="/my-workouts/:id/session/:sessionId/edit" element={<SessionPage />} />
          <Route path="/body" element={<BodyTracker />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-workouts/:workoutId/session/:sessionId" element={<SessionDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;