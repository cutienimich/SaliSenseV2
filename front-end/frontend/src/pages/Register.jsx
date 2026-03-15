import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Hindi magkapareho ang password. Subukan ulit.');
            return;
        }

        if (password.length < 8) {
            setError('Ang password ay dapat hindi bababa sa 8 karakter.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', { email, password });
            setSuccess('Matagumpay na nairehistro! Pakitingnan ang iyong email para ma-verify ang iyong account.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Nabigo ang pagpaparehistro. Subukan ulit.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h2>Mag-register</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Ilagay ang iyong email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Minimum 8 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Kumpirmahin ang Password</label>
                        <input
                            type="password"
                            placeholder="Ulitin ang password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            'Nagrerehistro...'
                        ) : (
                            <img src="/Register.png" alt="Mag-register" className="btn-register-img" />
                        )}
                    </button>
                </form>

                <p className="login-link">
                    Mayroon nang account? <Link to="/login">Mag-login dito</Link>
                </p>
            </div>
        </div>
    );
}