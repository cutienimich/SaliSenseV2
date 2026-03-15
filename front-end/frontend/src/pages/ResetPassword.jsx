import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import './ResetPassword.css';
export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const token = searchParams.get('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setError('Invalid o walang reset token. Subukan muli ang forgot password.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Dapat ay hindi bababa sa 6 characters ang password.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Hindi magkapareho ang mga password. Subukan muli.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token,
                new_password: newPassword
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'May error na naganap. Subukan muli.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-page">
            <div className="reset-card">
                {success ? (
                    <>
                        <img src="/happy.png" alt="happy" className="reset-emoji" />
                        <h2>Na-reset na ang Password!</h2>
                        <p className="reset-subtitle">
                            Matagumpay na na-reset ang iyong password. Ire-redirect ka sa login page...
                        </p>
                        <button className="reset-btn" onClick={() => navigate('/login')}>
                            Pumunta sa Login
                        </button>
                    </>
                ) : (
                    <>
                        <img src="/uwu.png" alt="uwu" className="reset-emoji" />
                        <h2>Mag-reset ng Password</h2>
                        <p className="reset-subtitle">Ilagay ang iyong bagong password.</p>

                        <form onSubmit={handleSubmit} className="reset-form">
                            {error && (
                                <div className="reset-error">⚠️ {error}</div>
                            )}

                            <div className="reset-group">
                                <label>Bagong Password</label>
                                <input
                                    type="password"
                                    placeholder="Ilagay ang bagong password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    disabled={!token}
                                />
                            </div>

                            <div className="reset-group">
                                <label>Ulitin ang Password</label>
                                <input
                                    type="password"
                                    placeholder="Ulitin ang bagong password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={!token}
                                />
                            </div>

                            <button
                                type="submit"
                                className="reset-btn"
                                disabled={loading || !token}
                            >
                                {loading ? 'Nagre-reset...' : 'I-reset ang Password'}
                            </button>

                            <Link to="/login" className="reset-back">
                                ← Bumalik sa Login
                            </Link>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}