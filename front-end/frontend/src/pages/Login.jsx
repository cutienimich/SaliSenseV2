import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Login.css';
import { useNavigate, useLocation, Link } from 'react-router-dom';




export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

// Sa loob ng Login component — add useLocation
const location = useLocation();

const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await api.post('/auth/login', { email, password });
        login(response.data.access_token);

        // Kunin yung intended path — full location object
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
    } catch (err) {
        setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="landing-page">
            {/* Section 1 - Title */}
            <section className="section title-section">

                <img src="/title.png" alt="SaliSense" className="title-img" />
                <p className="subtitle">Survey Form na kayang mag tumukoy ng sensimento sa isang kasagutan.</p>
                <a href="#login-section" className="scroll-down">
                    <img src="../Magsimula.png" alt="" />
                </a>
            </section>

            {/* Section 2 - Login Form */}
            <section className="section form-section" id="login-section">
                <div className="login-form-card">

                    <h2>Mag-login</h2>
                    {error && (
                        <div className="login-error-message">
                             {error === 'Invalid email or password' 
                                ? 'Mali ang email o password.' 
                                : error === 'Please verify your email first'
                                ? 'I-verify muna ang iyong email bago mag-login.'
                                : 'May error na naganap. Subukan muli.'}
                        </div>
                    )}
                    <form onSubmit={handleLogin}>
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
                                placeholder="Ilagay ang iyong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-extras">
                            <Link to="/forgot-password">Nakalimutan ang password?</Link>
                        </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            'Naglo-login...'
                        ) : (
                            <img src="/Login.png" alt="Login" className="btn-login-img" />
                        )}
                    </button>
                    </form>
                    <p className="register-link">
                        Wala pang account? <Link to="/register">Mag-register dito</Link>
                    </p>
                </div>
            </section>

            {/* Section 3 - About Us */}
            <section className="section about-section">

                <h2>Tungkol sa Amin</h2>
                <p>Kami ay grupo ng mga estudyante mula sa Colegio de Montalban. Aming binuo ang sistemang ito bilang parte ng aming proyekto para sa kursong Integrative Programming. Layunin ng Salisense na matukoy ang emosyon sa mga kasagutan ng bawat respondent upang makalap at malaman ang kabuuang kasagustan mula sa isang survey. </p>
            </section>

            {/* Section 4 - Follow Us */}
            <section className="section follow-section">

                <h2>Sundan Kami</h2>
                <div className="social-links">
                    <a href="https://www.facebook.com/rochellejhanechua" target='_blank'>Facebook</a>
                    <a href="https://github.com/cutienimich/">Github</a>
                    <a href="https://www.instagram.com/elemenomich/">Instagram</a>
                </div>
            </section>


            {/* Section 5 - Meet the Developers */}
            <section className="section developers-section">
                <h2>Kilalanin ang Aming mga Developer</h2>
                <div className="developers-grid">
                    <div className="developer-card">
                        <img 
                            src="/michelle.png" 
                            alt="Michelle Postrado"
                            className="dev-photo"
                        />
                        <h3>Michelle Riego Postrado</h3>
                        <span className="dev-role lead">Lead Developer</span>
                    </div>
                    <div className="developer-card">
                        <img 
                            src="https://randomuser.me/api/portraits/women/68.jpg" 
                            alt="Caira Grace San Pascual"
                            className="dev-photo"
                        />
                        <h3>Caira Grace San Pascual</h3>
                        <span className="dev-role designer">Designer</span>
                    </div>
                    <div className="developer-card">
                        <img 
                            src="https://randomuser.me/api/portraits/men/32.jpg" 
                            alt="Jhon Albert Fulgencio"
                            className="dev-photo"
                        />
                        <h3>Jhon Albert Fulgencio</h3>
                        <span className="dev-role documentator">Documentator</span>
                    </div>
                </div>
            </section>

        </div>
    );
}