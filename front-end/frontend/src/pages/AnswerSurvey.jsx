import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import viteLogo from '/vite.svg';
import './AnswerSurvey.css';

export default function AnswerSurvey() {
    const { token } = useParams();
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [fields, setFields] = useState([]);
    const [answers, setAnswers] = useState({});
    const [fieldAnswers, setFieldAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSurvey();
    }, [token]);

    const fetchSurvey = async () => {
        try {
            const surveyRes = await api.get(`/survey/${token}`);
            setSurvey(surveyRes.data);

            const [questionsRes, fieldsRes] = await Promise.all([
                api.get(`/questions/${surveyRes.data.survey_id}`),
                api.get(`/survey-fields/${surveyRes.data.survey_id}`)
            ]);

            setQuestions(questionsRes.data.questions || []);
            setFields(fieldsRes.data.fields || []);

            // Initialize answers
            const initialAnswers = {};
            questionsRes.data.questions.forEach(q => {
                initialAnswers[q.question_id] = '';
            });
            setAnswers(initialAnswers);

            // Initialize field answers
            const initialFieldAnswers = {};
            fieldsRes.data.fields.forEach(f => {
                initialFieldAnswers[f.field_id] = '';
            });
            setFieldAnswers(initialFieldAnswers);

        } catch (err) {
            if (err.response?.status === 403) {
                setError('Ang survey na ito ay hindi na aktibo.');
            } else if (err.response?.status === 404) {
                setError('Hindi mahanap ang survey.');
            } else if (err.response?.status === 401) {
                navigate(`/login?redirect=/answer/${token}`);
            } else {
                setError('May problema sa pag-load ng survey.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleFieldAnswerChange = (fieldId, value) => {
        setFieldAnswers({ ...fieldAnswers, [fieldId]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate required fields
        for (const f of fields) {
            if (f.is_required && !fieldAnswers[f.field_id]?.trim()) {
                setError(`Pakisagot ang "${f.field_label}" field.`);
                return;
            }
        }

        // Validate all questions answered
        for (const q of questions) {
            if (!answers[q.question_id]?.trim()) {
                setError(`Pakisagot ang lahat ng tanong.`);
                return;
            }
        }

        setSubmitting(true);

        try {
            // 1. Submit field responses first (if any)
            if (fields.length > 0) {
                const fieldAnswerPayload = fields.map(f => ({
                    field_id: f.field_id,
                    field_value: fieldAnswers[f.field_id] || ''
                }));

                await api.post('/field-responses', {
                    survey_id: survey.survey_id,
                    field_answers: fieldAnswerPayload
                });
            }

            // 2. Submit question answers
            for (const q of questions) {
                await api.post('/submit-response', {
                    question_id: q.question_id,
                    text: answers[q.question_id]
                });
            }

            setSubmitted(true);
        } catch (err) {
            if (err.response?.data?.detail === 'You have already answered this question') {
                setError('Nakapag-sagot ka na sa survey na ito.');
            } else {
                setError('Nabigo ang pag-submit. Subukan ulit.');
            }
        } finally {
            setSubmitting(false);
        }
    };

if (loading) {
    return (
        <div className="answer-survey">
            <header className="header">
                <div className="header-logo">
                    <img src={viteLogo} alt="Logo" className="logo-img" />
                    <span className="logo-text">SaliSense</span>
                </div>
            </header>
            <main className="main">
                {/* Survey info skeleton */}
                <div className="skeleton-card">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-text" />
                </div>

                {/* Question skeletons */}
                {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton-card">
                        <div className="skeleton skeleton-label" />
                        <div className="skeleton skeleton-textarea" />
                    </div>
                ))}

                {/* Button skeleton */}
                <div className="skeleton-submit" />
            </main>
        </div>
    );
}

    // Error
    if (error && !survey) {
        return (
            <div className="answer-survey">
                <header className="header">
                    <div className="header-logo">
                        <img src={viteLogo} alt="Logo" className="logo-img" />
                        <span className="logo-text">SaliSense</span>
                    </div>
                </header>
                <div className="error-screen">
                    <div className="error-card">
                        <span className="error-icon">⚠️</span>
                        <h2>{error}</h2>
                    </div>
                </div>
            </div>
        );
    }

    // Thank you screen
    if (submitted) {
        return (
            <div className="answer-survey">
                <header className="header">
                    <div className="header-logo">
                        <img src={viteLogo} alt="Logo" className="logo-img" />
                        <span className="logo-text">SaliSense</span>
                    </div>
                </header>
                <div className="thankyou-screen">
                    <div className="thankyou-card">
                        <span className="thankyou-icon">
                            <img src="/happy.png" alt="happy" className='happy' />
                        </span>
                        <h2>Salamat sa iyong sagot!</h2>
                        <p>Ang iyong mga sagot ay matagumpay na naitala.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="answer-survey">

            {/* Header */}
            <header className="header">
                <div className="header-logo">
                    <img src={viteLogo} alt="Logo" className="logo-img" />
                    <span className="logo-text">SaliSense</span>
                </div>
            </header>

            <main className="main">
                {/* Survey Info */}
                <div className="survey-info-card">
                    <h1>{survey?.title}</h1>
                    {survey?.description && <p>{survey.description}</p>}
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>

                    {/* Fields Section */}
                    {fields.length > 0 && (
                        <div className="fields-section">
                            <h2 className="section-title">Impormasyon ng Respondent</h2>
                            {fields.map(f => (
                                <div key={f.field_id} className="question-card">
                                    <div className="question-header">
                                        <span className="question-number">{f.field_label}</span>
                                        {f.is_required && <span className="question-required">*</span>}
                                    </div>
                                    {f.field_type === 'number' ? (
                                        <input
                                            type="number"
                                            className="answer-input-text"
                                            placeholder={`Ilagay ang ${f.field_label}`}
                                            value={fieldAnswers[f.field_id] || ''}
                                            onChange={(e) => handleFieldAnswerChange(f.field_id, e.target.value)}
                                            required={f.is_required}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            className="answer-input-text"
                                            placeholder={`Ilagay ang ${f.field_label}`}
                                            value={fieldAnswers[f.field_id] || ''}
                                            onChange={(e) => handleFieldAnswerChange(f.field_id, e.target.value)}
                                            required={f.is_required}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Questions Section */}
                    {questions.length > 0 && (
                        <div className="questions-section">
                            {fields.length > 0 && <h2 className="section-title">Mga Tanong</h2>}
                            {questions.map((q, index) => (
                                <div key={q.question_id} className="question-card">
                                    <div className="question-header">
                                        <span className="question-number">Tanong {index + 1}</span>
                                        <span className="question-required">*</span>
                                    </div>
                                    <p className="question-text">{q.question_text}</p>
                                    <textarea
                                        className="answer-input"
                                        placeholder="Isulat ang iyong sagot dito..."
                                        value={answers[q.question_id] || ''}
                                        onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
                                        rows={4}
                                        maxLength={1000}
                                        required
                                    />
                                    <span className="char-count">
                                        {answers[q.question_id]?.length || 0}/1000
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="submit-area">
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={submitting}
                        >
                            {submitting ? 'Isinusumite...' : 'Isumite ang mga Sagot'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}