import { useNavigate } from 'react-router-dom';
import './Placeholder.css';

export default function Placeholder() {
    const navigate = useNavigate();

    return (
        <div className="placeholder-page">
            <div className="placeholder-card">
                <img
                    src="https://i.pinimg.com/236x/ec/52/04/ec520428c0ec509cf1284b4d12c300c2.jpg"
                    alt="No budget"
                    className="placeholder-img"
                    onError={(e) => { e.target.src = 'https://cdn.pixabay.com/photo/2016/03/31/19/14/sad-1294412_640.png'; }}
                />
                <h2>Sorry...</h2>
                <p>Wala kaming budget sa button na to </p>
                <button className="placeholder-btn" onClick={() => navigate('/dashboard')}>
                    ← Bumalik
                </button>
            </div>
        </div>
    );
}