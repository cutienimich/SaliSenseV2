import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateSurvey from './pages/CreateSurvey';
import SurveyDetail from './pages/SurveyDetail';
import AnswerSurvey from './pages/AnswerSurvey';
import Placeholder from './pages/Placeholder';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/placeholder" element={<Placeholder />} />

            {/* Answer survey — public pero kailangan ng login */}
            <Route path="/answer/:token" element={
                <ProtectedRoute>
                    <AnswerSurvey />
                </ProtectedRoute>
            } />

            {/* Protected routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/create-survey" element={
                <ProtectedRoute>
                    <CreateSurvey />
                </ProtectedRoute>
            } />
            <Route path="/survey/:surveyId" element={
                <ProtectedRoute>
                    <SurveyDetail />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default App;