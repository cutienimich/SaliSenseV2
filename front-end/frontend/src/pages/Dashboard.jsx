import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import viteLogo from '/vite.svg';
import './Dashboard.css';

export default function Dashboard() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [modal, setModal] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchSurveys();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSurveys = async () => {
        try {
            const response = await api.get('/surveys');
            setSurveys(response.data);
        } catch (err) {
            console.error('Failed to fetch surveys:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const featured = surveys[0];
    const rest = surveys.slice(1);

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="header">
                <div className="header-logo">
                    <img src="/happy.png" alt="Logo" className="logo-img" />
                    <span className="logo-text">SaliSense</span>
                </div>

                <div className="header-profile" ref={dropdownRef}>
                    <button className="profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <div className="avatar">{user?.email?.charAt(0).toUpperCase()}</div>
                    </button>

                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <div className="dropdown-email">{user?.email}</div>
                            <hr />
                            <button className="dropdown-item" onClick={() => { setModal('about'); setDropdownOpen(false); }}>
                                Tungkol sa Amin
                            </button>
                            <button className="dropdown-item" onClick={() => { setModal('terms'); setDropdownOpen(false); }}>
                                Mga Tuntunin at Patakaran
                            </button>
                            <button className="dropdown-item" onClick={() => { setModal('follow'); setDropdownOpen(false); }}>
                                Sundan Kami
                            </button>
                            <hr />
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                Mag-logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Modals */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setModal(null)}>✕</button>

                        {modal === 'about' && (
                            <>
                                <h2>Tungkol sa Amin</h2>
                                <p>Ang <strong>SaliSense</strong> ay isang makabagong sistema ng survey na gumagamit ng artificial intelligence para suriin ang emosyon at sentiment ng mga sagot ng mga respondent.</p>
                                
                                <p>. Shout out kay Rochelle wutwuw, tapos na kami sa system AHAHAHAHHA</p>
                            </>
                        )}

                        {modal === 'terms' && (
                            <>
                                <h2>Mga Tuntunin at Patakaran</h2>
                                <div className="terms-content">
                                    <h4>1. Paggamit ng System</h4>
                                    <p>Ang EmotiSurvey ay para lamang sa lehitimong pananaliksik at pagkolekta ng datos.</p>
                                    <h4>2. Privacy ng Datos</h4>
                                    <p>Ang lahat ng sagot ng mga respondent ay nananatiling kumpidensyal at hindi ibabahagi sa ibang partido.</p>
                                    <h4>3. Responsibilidad ng User</h4>
                                    <p>Ang bawat user ay responsable sa katumpakan ng kanilang mga survey at sa etikal na paggamit ng sistema.</p>
                                    <h4>4. Limitasyon</h4>
                                    <p>Ang AI analysis ay batay sa modelo at maaaring hindi palaging perpekto. Gamitin bilang gabay lamang.</p>
                                </div>
                            </>
                        )}

                        {modal === 'follow' && (
                            <>
                                <h2>Sundan Kami</h2>
                                <p>Manatiling updated sa aming mga bagong features at announcements!</p>
                                <div className="follow-links">
                                    <a href="/placeholder" target="_blank" rel="noopener noreferrer" className="follow-btn facebook">
                                         Facebook
                                    </a>
                                    <a href="/placeholder" target="_blank" rel="noopener noreferrer" className="follow-btn twitter">
                                        Github
                                    </a>
                                    <a href="/placeholder" target="_blank" rel="noopener noreferrer" className="follow-btn instagram">
                                         Instagram
                                    </a>
                                    <a href="/placeholder" target="_blank" rel="noopener noreferrer" className="follow-btn github">
                                        Linkedin
                                    </a>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}

            {/* Main */}
            <main className="main">
                <div className="main-topbar">
                    <h1>Aking mga Survey</h1>
                </div>

                {loading ? (
                    <div className="loading">Naglo-load...</div>
                ) : surveys.length === 0 ? (
                    <div className="empty-state">
                        <p>Wala pang survey na nagawa.</p>
                    </div>
                ) : (
                    <>
                        {featured && (
                            <div className="featured-survey" onClick={() => navigate(`/survey/${featured.survey_id}`)}>
                                <div className="featured-badge">Pinakabago</div>
                                <h2>{featured.title}</h2>
                                <p>{featured.description || 'Walang paglalarawan'}</p>
                                <div className="featured-footer">
                                    <span className={`status ${featured.is_active ? 'active' : 'inactive'}`}>
                                        {featured.is_active ? 'Aktibo' : 'Hindi Aktibo'}
                                    </span>
                                    <span className="survey-date">
                                        {new Date(featured.created_at).toLocaleDateString('fil-PH')}
                                    </span>
                                    <span className="respondent-count">
                                        👥 {featured.respondent_count} sumagot
                                    </span>
                                </div>
                            </div>
                        )}

                        {rest.length > 0 && (
                            <>
                                <h3 className="list-title">Iba pang mga Survey</h3>
                                <div className="survey-list">
                                    {rest.map(survey => (
                                        <div
                                            key={survey.survey_id}
                                            className="survey-card"
                                            onClick={() => navigate(`/survey/${survey.survey_id}`)}
                                        >
                                            <div className="survey-card-info">
                                                <h4>{survey.title}</h4>
                                                <p>{survey.description || 'Walang paglalarawan'}</p>
                                            </div>
                                            <div className="survey-card-right">
                                                <span className={`status ${survey.is_active ? 'active' : 'inactive'}`}>
                                                    {survey.is_active ? 'Aktibo' : 'Hindi Aktibo'}
                                                </span>
                                                <span className="survey-date">
                                                    {new Date(survey.created_at).toLocaleDateString('fil-PH')}
                                                </span>
                                                <span className="respondent-count">
                                                    👥 {survey.respondent_count} sumagot
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
                <button className="btn-create btn-create-bottom" onClick={() => navigate('/create-survey')}>
                    + Gumawa ng Survey
                </button>
            </main>
        </div>
    );
}