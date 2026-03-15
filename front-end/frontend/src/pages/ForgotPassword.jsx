import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './ForgotPassword.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError('May error na naganap. Subukan muli.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-page">
            <div className="forgot-card">
                <img src="/sad.png" alt="sad" className="forgot-emoji" />
                <h2>Nakalimutan ang Password?</h2>
                <p className="forgot-subtitle">Ilagay ang iyong email at magpapadala kami ng reset link.</p>

                {success ? (
                    <div className="forgot-success">
                        <img src="/happy.png" alt="happy" className="forgot-emoji-sm" />
                        <p>Kung may account ka sa email na iyon, makakatanggap ka ng reset link!</p>
                        <button className="forgot-btn" onClick={() => navigate('/login')}>
                            Bumalik sa Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && <div className="forgot-error">⚠️ {error}</div>}
                        <div className="forgot-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Ilagay ang iyong email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="forgot-btn" disabled={loading}>
                            {loading ? 'Nagpapadala...' : 'Magpadala ng Reset Link'}
                        </button>
                        <Link to="/login" className="forgot-back">← Bumalik sa Login</Link>
                    </form>
                )}
            </div>
        </div>
    );
}