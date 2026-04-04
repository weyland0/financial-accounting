import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/forbidden.css';

export function Forbidden() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="forbidden-container">
            <div className="forbidden-card">
                <div className="forbidden-icon">🔒</div>

                <p className="forbidden-code">403 — Доступ запрещён</p>
                <h1>Недостаточно прав</h1>

                <p className="forbidden-description">
                    У вас нет доступа к этой странице. Обратитесь к администратору,
                    если считаете, что это ошибка.
                </p>

                {user?.roleName && (
                    <div className="forbidden-role-badge">
                        Ваша роль: <span>{user?.roleName}</span>
                    </div>
                )}

                <div className="forbidden-divider" />

                <button
                    className="btn-forbidden-home"
                    onClick={() => navigate('/dashboard')}
                >
                    Вернуться на главную
                </button>
                <button
                    className="btn-forbidden-back"
                    onClick={() => navigate(-1)}
                >
                    Назад
                </button>
            </div>
        </div>
    );
};
