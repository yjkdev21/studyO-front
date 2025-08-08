import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './PasswordModal.css';

function PasswordModal({
    isOpen,
    onCancel,
    onConfirm,
    loading = false,
    error = '',
}) {
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setPassword('');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password.trim() && !loading) {
            onConfirm(password);
        }
    };

    const handleInputChange = (e) => {
        setPassword(e.target.value);
    };

    return createPortal(
        <div className="password-modal-overlay">
            <div className="password-modal-content">
                <div className="password-modal-header">
                    <h2>Password</h2>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="password-input-container">
                        <input
                            type="password"
                            value={password}
                            onChange={handleInputChange}
                            placeholder="비밀번호를 입력하세요"
                            className={`password-input ${error ? 'error' : ''}`}
                            disabled={loading}
                            autoFocus
                        />
                        {error && (
                            <div className="password-error-message">
                                {error}
                            </div>
                        )}
                    </div>
                    
                    <div className="password-modal-buttons">
                        <button 
                            type="button"
                            onClick={onCancel}
                            className="password-cancel-btn"
                            disabled={loading}
                        >
                            취소
                        </button>
                        <button 
                            type="submit"
                            className="password-confirm-btn"
                            disabled={!password.trim() || loading}
                        >
                            {loading ? '확인 중...' : '확인'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default PasswordModal;