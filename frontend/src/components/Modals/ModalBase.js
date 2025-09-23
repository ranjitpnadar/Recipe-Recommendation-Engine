import React from 'react';

function ModalBase({ isOpen, onClose, children, className = '' }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal" style={{ display: 'flex' }} onClick={handleBackdropClick}>
      <div className={`modal-content ${className}`}>
        <span className="close-button" onClick={onClose}>&times;</span>
        {children}
      </div>
    </div>
  );
}

export default ModalBase;