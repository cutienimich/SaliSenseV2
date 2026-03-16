import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import viteLogo from '/vite.svg';
import { useAuth } from '../context/AuthContext';
import './CreateSurvey.css';

export default function CreateSurvey() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([{ question_text: '' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { logout } = useAuth();
    const navigate = useNavigate();

    const addQuestion = () => {
        setQuestions([...questions, { question_text: '' }]);
    };

    const removeQuestion = (index) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index, value) => {
        const updated = [...questions];
        updated[index].question_text = value;
        setQuestions(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].question_text.trim()) {
                setError(`Tanong #${i + 1} ay walang laman.`);
                return;
            }
        }

        setLoading(true);

        try {
            const surveyResponse = await api.post('/surveys', { title, description });
            const surveyId = surveyResponse.data.survey_id;

            for (const question of questions) {
                await api.post('/questions', {
                    survey_id: surveyId,
                    question_text: question.question_text
                });
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Nabigo ang paggawa ng survey. Subukan ulit.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-survey">

            {/* Header */}
            <header className="header">
                <div className="header-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                    <img src="/happy.png" alt="Logo" className="logo-img" />
                    <span className="logo-text">SaliSense</span>
                </div>

            </header>

            {/* Main */}
            <main className="main">
                <h1>Gumawa ng Bagong Survey</h1>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>

                    {/* Survey Details */}
                    <div className="form-card">
                        <h2>Detalye ng Survey</h2>
                        <div className="form-group">
                            <label>Pamagat ng Survey</label>
                            <input
                                type="text"
                                placeholder="Ilagay ang pamagat"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                maxLength={255}
                            />
                        </div>
                        <div className="form-group">
                            <label>Paglalarawan <span className="optional">(opsyonal)</span></label>
                            <textarea
                                placeholder="Ilarawan ang iyong survey"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={1000}
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="questions-section">
                        <h2>Mga Tanong</h2>

                        {questions.map((question, index) => (
                            <div key={index} className="question-card">
                                <div className="question-header">
                                    <span className="question-number">Tanong #{index + 1}</span>
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn-remove"
                                            onClick={() => removeQuestion(index)}
                                        >
                                            ✕ Alisin
                                        </button>
                                    )}
                                </div>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="Ilagay ang iyong tanong"
                                        value={question.question_text}
                                        onChange={(e) => updateQuestion(index, e.target.value)}
                                        required
                                        maxLength={500}
                                    />
                                </div>
                            </div>
                        ))}

                        <button type="button" className="btn-add-question" onClick={addQuestion}>
                            + Magdagdag ng Tanong
                        </button>
                    </div>

                    {/* Submit */}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>
                            Kanselahin
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Ginagawa...' : 'Gumawa ng Survey'}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}