import React from 'react';

function Button({ 
  children, 
  onClick, 
  className = '', 
  type = 'button', 
  icon,
  disabled = false,
  ...props 
}) {
  return (
    <button
      type={type}
      className={`btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <i className={icon}></i>}
      {children && <span>{children}</span>}
    </button>
  );
}

export default Button;