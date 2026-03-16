import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import viteLogo from '/vite.svg';
import './SurveyDetail.css';
// Add sa imports sa taas ng file
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Color palettes
const SENTIMENT_COLORS = {
    positive: '#68d391',
    negative: '#ff6b6b',
    neutral: '#a0aec0'
};
const EMOTION_COLORS = {
    joy: '#FFD700',
    optimism: '#FFB300',
    approval: '#68d391',
    caring: '#f687b3',
    admiration: '#9f7aea',
    love: '#ff6b9d',
    desire: '#ed8936',
    excitement: '#fc8181',
    amusement: '#63b3ed',
    gratitude: '#4fd1c5',
    pride: '#667eea',
    relief: '#76e4f7',
    surprise: '#f6e05e',
    anger: '#e53e3e',
    fear: '#553c9a',
    sadness: '#4299e1',
    disgust: '#276749',
    disappointment: '#718096',
    disapproval: '#c53030',
    grief: '#2d3748',
    remorse: '#744210',
    embarrassment: '#feb2b2',
    nervousness: '#faf089',
    neutral: '#a0aec0',
    realization: '#76e4f7',
    confusion: '#d69e2e',
    curiosity: '#48bb78',
    annoyance: '#dd6b20',
};

const FALLBACK_COLORS = ['#FFB300','#FF6F00','#68d391','#ff6b6b','#a0aec0',
    '#764ba2','#667eea','#ed8936','#48bb78','#63b3ed'];

const EmotionPieChart = ({ data, colorMap }) => {
    const chartData = Object.entries(data).map(([name, val]) => ({
        name,
        value: val.count,
        percentage: val.percentage
    }));

    const getColor = (name, index) => {
        if (colorMap && colorMap[name]) return colorMap[name];
        if (EMOTION_COLORS[name]) return EMOTION_COLORS[name];
        return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        if (percentage < 8) return null;
        return (
            <text x={x} y={y} fill="white" textAnchor="middle"
                dominantBaseline="central" fontSize={12}
                fontFamily="Ubuntu" fontWeight="bold">
                {`${percentage}%`}
            </text>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                >
                    {chartData.map((entry, index) => (
                        <Cell
                            key={entry.name}
                            fill={getColor(entry.name, index)}
                        />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value, name) => [`${value} sagot`, name]}
                    contentStyle={{
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #FFB300',
                        borderRadius: '8px',
                        color: '#ccc',
                        fontFamily: 'Ubuntu',
                        fontSize: '0.85rem'
                    }}
                />
                <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: '12px', fontSize: '0.8rem' }}
                    formatter={(value) => (
                        <span style={{ color: '#ccc', fontSize: '0.8rem', fontFamily: 'Ubuntu' }}>
                            {value}
                        </span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};
export default function SurveyDetail() {
    const { surveyId } = useParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const [newQuestion, setNewQuestion] = useState({ question_text: '' });
    const [addingQuestion, setAddingQuestion] = useState(false);

    const [newField, setNewField] = useState({ field_label: '', field_type: 'text', is_required: true });
    const [addingField, setAddingField] = useState(false);

    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    // Add sa state
const [summaries, setSummaries] = useState({});
const [loadingSummary, setLoadingSummary] = useState({});

const generateSummary = async (questionId) => {
    setLoadingSummary(prev => ({ ...prev, [questionId]: true }));
    try {
        const res = await api.get(`/analytics/${surveyId}/summary/${questionId}?regenerate=true`);
        setSummaries(prev => ({ ...prev, [questionId]: res.data.summary }));
    } catch (err) {
        console.error('Failed to generate summary:', err);
    } finally {
        setLoadingSummary(prev => ({ ...prev, [questionId]: false }));
    }
};

const fetchSummary = async (questionId) => {
    setLoadingSummary(prev => ({ ...prev, [questionId]: true }));
    try {
        const res = await api.get(`/analytics/${surveyId}/summary/${questionId}`);
        setSummaries(prev => ({ ...prev, [questionId]: res.data.summary }));
    } catch (err) {
        console.error('Failed to fetch summary:', err);
    } finally {
        setLoadingSummary(prev => ({ ...prev, [questionId]: false }));
    }
};

    useEffect(() => {
        fetchSurveyData();
    }, [surveyId]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (activeTab === 'responses') fetchResponses();
        if (activeTab === 'analytics') fetchAnalytics();
        if (activeTab === 'fields') fetchFields();
    }, [activeTab]);

   // fetchSurveyData — add analytics fetch
const fetchSurveyData = async () => {
    try {
        const [surveyRes, questionsRes, analyticsRes] = await Promise.all([
            api.get(`/surveys`),
            api.get(`/questions/${surveyId}`),
            api.get(`/analytics/${surveyId}`)
        ]);
        const found = surveyRes.data.find(s => s.survey_id === parseInt(surveyId));
        setSurvey(found);
        setEditTitle(found?.title || '');
        setEditDescription(found?.description || '');
        setQuestions(questionsRes.data.questions || []);
        setAnalytics(analyticsRes.data);

        const existingSummaries = {};
        for (const q of analyticsRes.data.per_question || []) {
            if (q.ai_summary) existingSummaries[q.question_id] = q.ai_summary;
        }
        setSummaries(existingSummaries);

    } catch (err) {
        setError('Hindi ma-load ang survey.');
    } finally {
        setLoading(false);
    }
};

    const fetchResponses = async () => {
        try {
            const res = await api.get(`/responses/${surveyId}`);
            setResponses(res.data.responses || []);
        } catch (err) {
            console.error('Failed to fetch responses:', err);
        }
    };

const fetchAnalytics = async () => {
    try {
        const res = await api.get(`/analytics/${surveyId}`);
        setAnalytics(res.data);

        // Load existing summaries
        const existingSummaries = {};
        for (const q of res.data.per_question || []) {
            if (q.ai_summary) {
                existingSummaries[q.question_id] = q.ai_summary;
            }
        }
        setSummaries(existingSummaries);
    } catch (err) {
        console.error('Failed to fetch analytics:', err);
    }
};

    const fetchFields = async () => {
        try {
            const res = await api.get(`/survey-fields/${surveyId}`);
            setFields(res.data.fields || []);
        } catch (err) {
            console.error('Failed to fetch fields:', err);
        }
    };

    const handleToggle = async () => {
        try {
            const res = await api.patch(`/surveys/${surveyId}/toggle`);
            setSurvey({ ...survey, is_active: res.data.is_active });
        } catch (err) {
            console.error('Failed to toggle survey:', err);
        }
    };

    const handleCopyLink = () => {
        const token = survey?.survey_link?.replace('/survey/', '');
        const link = `${window.location.origin}/answer/${token}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveEdit = async () => {
        try {
            await api.put(`/surveys/${surveyId}`, {
                title: editTitle,
                description: editDescription
            });
            setSurvey({ ...survey, title: editTitle, description: editDescription });
            setEditMode(false);
        } catch (err) {
            console.error('Failed to update survey:', err);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Sigurado ka bang gusto mong burahin ang tanong na ito?')) return;
        try {
            await api.delete(`/questions/${questionId}`);
            setQuestions(questions.filter(q => q.question_id !== questionId));
        } catch (err) {
            console.error('Failed to delete question:', err);
        }
    };

    const handleAddQuestion = async () => {
        if (!newQuestion.question_text.trim()) return;
        setAddingQuestion(true);
        try {
            const res = await api.post('/questions', {
                survey_id: parseInt(surveyId),
                question_text: newQuestion.question_text
            });
            setQuestions([...questions, {
                question_id: res.data.question_id,
                question_text: newQuestion.question_text
            }]);
            setNewQuestion({ question_text: '' });
        } catch (err) {
            console.error('Failed to add question:', err);
        } finally {
            setAddingQuestion(false);
        }
    };

    const handleAddField = async () => {
        if (!newField.field_label.trim()) return;
        setAddingField(true);
        try {
            const res = await api.post('/survey-fields', {
                survey_id: parseInt(surveyId),
                field_label: newField.field_label,
                field_type: newField.field_type,
                is_required: newField.is_required
            });
            setFields([...fields, {
                field_id: res.data.field_id,
                field_label: newField.field_label,
                field_type: newField.field_type,
                is_required: newField.is_required
            }]);
            setNewField({ field_label: '', field_type: 'text', is_required: true });
        } catch (err) {
            console.error('Failed to add field:', err);
        } finally {
            setAddingField(false);
        }
    };

    const handleDeleteField = async (fieldId) => {
        if (!window.confirm('Sigurado ka bang gusto mong burahin ang field na ito?')) return;
        try {
            await api.delete(`/survey-fields/${fieldId}`);
            setFields(fields.filter(f => f.field_id !== fieldId));
        } catch (err) {
            console.error('Failed to delete field:', err);
        }
    };

    const handleTabChange = (tab) => {
        if (editMode) setEditMode(false);
        setActiveTab(tab);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

  if (loading) {
    return (
        <div className="survey-detail">
            <header className="header">
                <div className="header-logo" style={{ cursor: 'pointer' }}>
                    <img src={viteLogo} alt="Logo" className="logo-img" />
                    <span className="logo-text">SaliSense</span>
                </div>
            </header>
            <main className="main">
                <div className="skeleton-card">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-text" />
                </div>
                <div className="skeleton-tabs">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="skeleton skeleton-tab" />
                    ))}
                </div>
                {[1,2,3].map(i => (
                    <div key={i} className="skeleton-card">
                        <div className="skeleton skeleton-label" />
                        <div className="skeleton skeleton-textarea" />
                    </div>
                ))}
            </main>
        </div>
    );
}
    if (error) return <div className="error-screen">{error}</div>;

    return (
        <div className="survey-detail">

            {/* Header */}
            <header className="header">
                <div className="header-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
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
                            <button className="dropdown-item logout" onClick={handleLogout}>Mag-logout</button>
                        </div>
                    )}
                </div>
            </header>

            <main className="main">
                <div className="page-top">
                    <button className="btn-back" onClick={() => navigate('/dashboard')}>← Bumalik</button>
                    <div className="survey-title-area">
                        {editMode ? (
                            <div className="edit-title-form">
                                <input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="edit-input-title"
                                />
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="edit-input-desc"
                                    rows={2}
                                />
                                <div className="edit-actions">
                                    <button className="btn-save" onClick={handleSaveEdit}>I-save</button>
                                    <button className="btn-cancel" onClick={() => setEditMode(false)}>Kanselahin</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1>{survey?.title}</h1>
                                <p className="survey-desc">{survey?.description || 'Walang paglalarawan'}</p>
                            </>
                        )}
                    </div>

                    <div className="survey-actions">
                        <span className={`status ${survey?.is_active ? 'active' : 'inactive'}`}>
                            {survey?.is_active ? 'Aktibo' : 'Hindi Aktibo'}
                        </span>
                        <button className="btn-toggle" onClick={handleToggle}>
                            {survey?.is_active ? 'I-deactivate' : 'I-activate'}
                        </button>
                        <button className="btn-copy" onClick={handleCopyLink}>
                            {copied ? '✓ Nakopya!' : ' Kopyahin ang Link'}
                        </button>
                        {!editMode && (
                            <button className="btn-edit" onClick={() => setEditMode(true)}> I-edit</button>
                        )}
                        <button
                            className="btn-delete-survey"
                            onClick={async () => {
                                if (!window.confirm('Sigurado ka bang gusto mong burahin ang survey na ito? Hindi na ito mababawi.')) return;
                                try {
                                    await api.delete(`/surveys/${surveyId}`);
                                    navigate('/dashboard');
                                } catch (err) {
                                    console.error('Failed to delete survey:', err);
                                }
                            }}
                        >
                             Burahin
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    {['overview', 'fields', 'questions', 'responses', 'analytics'].map(tab => (
                        <button
                            key={tab}
                            className={`tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab)}
                        >
                            {tab === 'overview' && 'Overview'}
                            {tab === 'fields' && 'Mga Field'}
                            {tab === 'questions' && 'Mga Tanong'}
                            {tab === 'responses' && 'Mga Sagot'}
                            {tab === 'analytics' && 'Analytics'}
                        </button>
                    ))}
                </div>

                <div className="tab-content">

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="overview-tab">
                            <div className="overview-cards">
                                <div className="overview-card">
                                    <span className="card-label">Kabuuang Tanong</span>
                                    <span className="card-value">{questions.length}</span>
                                </div>
                                
                                <div className="overview-card">
                                    <span className="card-label">Bilang ng Sumagot</span>
                                    <span className="card-value">{analytics?.total_respondents ?? '—'}</span>
                                </div>
                                <div className="overview-card">
                                    <span className="card-label">Status</span>
                                    <span className={`card-value ${survey?.is_active ? 'text-active' : 'text-inactive'}`}>
                                        {survey?.is_active ? 'Aktibo' : 'Hindi Aktibo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fields Tab */}
                    {activeTab === 'fields' && (
                        <div className="questions-tab">
                            <p className="fields-info">
                                Dito nakalagay ang karagdagang impormasyon ng respondent.
                                
                            </p>

                            {fields.length === 0 ? (
                                <p className="empty-text">Wala pang mga field.</p>
                            ) : (
                                fields.map((f) => (
                                    <div key={f.field_id} className="question-item">
                                        <div className="question-item-info">
                                            <div>
                                                <p className="q-text">{f.field_label}</p>
                                                <div className="field-badges">
                                                    <span className="q-type">{f.field_type}</span>
                                                    {f.is_required && (
                                                        <span className="q-type required-badge">Kinakailangan</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteField(f.field_id)}
                                        >
                                            <i className="fas fa-trash-alt"></i> Burahin
                                        </button>
                                    </div>
                                ))
                            )}

                            {/* Add Field Form */}
                            <div className="add-question-form">
                                <h3>Magdagdag ng Field</h3>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="Label ng field (e.g. Age, Year Level)"
                                        value={newField.field_label}
                                        onChange={(e) => setNewField({ ...newField, field_label: e.target.value })}
                                        maxLength={100}
                                    />
                                </div>
                                <div className="form-group">
                                    <select
                                        value={newField.field_type}
                                        onChange={(e) => setNewField({ ...newField, field_type: e.target.value })}
                                    >
                                        <option value="text">Text</option>

                                    </select>
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={newField.is_required}
                                            onChange={(e) => setNewField({ ...newField, is_required: e.target.checked })}
                                        />
                                        Kinakailangan
                                    </label>
                                </div>
                                <button
                                    className="btn-add"
                                    onClick={handleAddField}
                                    disabled={addingField}
                                >
                                    {addingField ? 'Nagdadagdag...' : '+ Idagdag'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Questions Tab */}
                    {activeTab === 'questions' && (
                        <div className="questions-tab">
                            {questions.length === 0 ? (
                                <p className="empty-text">Wala pang tanong.</p>
                            ) : (
                                questions.map((q, index) => (
                                    <div key={q.question_id} className="question-item">
                                        <div className="question-item-info">
                                            <span className="q-number">#{index + 1}</span>
                                            <div>
                                                <p className="q-text">{q.question_text}</p>
                                            </div>
                                        </div>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteQuestion(q.question_id)}
                                        >
                                             Burahin
                                        </button>
                                    </div>
                                ))
                            )}

                            <div className="add-question-form">
                                <h3>Magdagdag ng Tanong</h3>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="Ilagay ang tanong"
                                        value={newQuestion.question_text}
                                        onChange={(e) => setNewQuestion({ question_text: e.target.value })}
                                        maxLength={500}
                                    />
                                </div>
                                <button
                                    className="btn-add"
                                    onClick={handleAddQuestion}
                                    disabled={addingQuestion}
                                >
                                    {addingQuestion ? 'Nagdadagdag...' : '+ Idagdag'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Responses Tab */}
                    {activeTab === 'responses' && (
                        <div className="responses-tab">
                            {responses.length === 0 ? (
                                <p className="empty-text">Wala pang mga sagot.</p>
                            ) : (
                                <table className="responses-table">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Tanong</th>
                                            <th>Sagot</th>
                                            <th>Emosyon</th>
                                            <th>Sentiment</th>
                                            <th>Score</th>
                                            <th>Petsa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {responses.map(r => (
                                            <tr key={r.response_id}>
                                                <td>{r.respondent_email}</td>
                                                <td>{r.question_text}</td>
                                                <td>{r.original_text}</td>
                                                <td><span className="emotion-badge">{r.emotion_label}</span></td>
                                                <td>
                                                    <span className={`sentiment-badge ${r.sentiment_label}`}>
                                                        {r.sentiment_label}
                                                    </span>
                                                </td>
                                                <td>{(r.sentiment_score * 100).toFixed(1)}%</td>
                                                <td>{new Date(r.created_at).toLocaleDateString('fil-PH')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Analytics Tab */}
{activeTab === 'analytics' && (
    <div className="analytics-tab">
        {!analytics ? (
            <p className="empty-text">Naglo-load ng analytics...</p>
        ) : analytics.total_responses === 0 ? (
            <p className="empty-text">Wala pang mga sagot para sa analytics.</p>
        ) : (
            <>
                {/* Overall Charts 
                <div className="charts-row">
                    <div className="chart-box">
                        <h3>Kabuuang Distribusyon ng Sentiment</h3>
                        <EmotionPieChart
                            data={analytics.sentiment_distribution}
                            colorMap={SENTIMENT_COLORS}
                        />
                    </div>
                    <div className="chart-box">
                        <h3>Kabuuang Distribusyon ng Emosyon</h3>
                        <EmotionPieChart
                            data={analytics.emotion_distribution}
                            colorMap={null}
                        />
                    </div>
                </div>*/}

                {/* Per Question */}
                <h3 className="per-question-title">Mga Tanong</h3>
                {analytics.per_question.map(q => (
                    <div key={q.question_id} className="question-analytics">
                        <p className="q-analytics-text">{q.question_text}</p>

                        <div className="charts-row">
                            <div className="chart-box">
                                <p className="analytics-sub-title">Sentiment</p>
                                <EmotionPieChart
                                    data={q.sentiment_distribution}
                                    colorMap={SENTIMENT_COLORS}
                                />
                            </div>
                            <div className="chart-box">
                                <p className="analytics-sub-title">Emosyon</p>
                                <EmotionPieChart
                                    data={q.emotion_distribution}
                                    colorMap={null}
                                />
                            </div>
                        </div>

                        {/* AI Summary */}
                        <div className="ai-summary-section">
                            {!summaries[q.question_id] ? (
                                <button
                                    className="btn-generate-summary"
                                    onClick={() => fetchSummary(q.question_id)}
                                    disabled={loadingSummary[q.question_id]}
                                >
                                    {loadingSummary[q.question_id] ? '✨ Ginagawa ang summary...' : '✨ Gumawa ng AI Summary'}
                                </button>
                            ) : (
                                <div className="ai-summary-card">
                                    <div className="ai-summary-header">
                                        <span className="ai-badge">✨ AI Summary</span>
                                    </div>
                                    <p className="ai-summary-text">{summaries[q.question_id]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </>
        )}
    </div>
)}
                </div>
            </main>
        </div>
    );
}