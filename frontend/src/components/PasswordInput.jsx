import { useState } from 'react';

const EyeIcon = ({ off }) => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.17 8a13 13 0 0 1 1.66-2.04C4.12 4.67 5.88 3.5 8 3.5s3.87 1.17 5.17 2.46A13 13 0 0 1 14.83 8q-.09.13-.2.3c-.36.52-.89 1.2-1.46 1.74C11.88 11.33 10.12 12.5 8 12.5s-3.88-1.17-5.17-2.46A13 13 0 0 1 1.17 8" />
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
    {off && <path d="M1.5 1.5l13 13" stroke="currentColor" strokeWidth="1.3" />}
  </svg>
);

// Password field with a show / hide toggle
export default function PasswordInput({ id, value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-group">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className="form-control"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  );
}
