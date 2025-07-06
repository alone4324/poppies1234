import React, { useState, useRef } from 'react';

const ACCENT_COLOR = '#6913c5';
const ERROR_COLOR = '#e91e63';
const SUCCESS_COLOR = '#27ae60';
const FONT_FAMILY = "'Paytone One', 'Inter', Arial, sans-serif";

const EntryGate = ({ onSuccess }: { onSuccess: () => void }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length <= 6) setCode(val);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Enter your 6-character code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        localStorage.setItem('entryGatePassed', '1');
        setShowLoading(true);
        setTimeout(() => {
          setShowLoading(false);
          onSuccess();
        }, 1200); // 1.2s glassy loading overlay
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 99999,
      background: 'rgba(20, 20, 23, 0.92)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.4s',
      opacity: 0,
      animation: 'fadeInEntryGate 0.7s cubic-bezier(.4,0,.2,1) forwards',
    }}>
      {showLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(44, 27, 78, 0.25)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          transition: 'background 0.4s',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(59,8,115,0.18)',
            border: '1.5px solid rgba(255,255,255,0.18)',
            padding: '40px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 220,
            maxWidth: 320,
            animation: 'fadeInGate 0.7s cubic-bezier(.4,0,.2,1)',
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '4px solid rgba(255,255,255,0.25)',
              borderTop: '4px solid #6913c5',
              animation: 'spin 1s linear infinite',
              marginBottom: 18,
            }} />
            <div style={{
              fontFamily: FONT_FAMILY,
              fontSize: 22,
              color: '#fff',
              textAlign: 'center',
              textShadow: '0 2px 8px #3b087355',
              fontWeight: 700,
              letterSpacing: 1.1,
            }}>
              Loading app...
            </div>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'rgba(255,255,255,0.10)',
          borderRadius: 28,
          boxShadow: '0 12px 48px rgba(59,8,115,0.25)',
          padding: '48px 32px 40px 32px',
          minWidth: 320,
          maxWidth: 380,
          width: '90vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '2px solid rgba(255,255,255,0.18)',
          position: 'relative',
          animation: 'fadeInGate 0.7s cubic-bezier(.4,0,.2,1)',
          backdropFilter: 'blur(16px) saturate(1.2)',
        }}
      >
        <img
          src="/images/logo.png"
          alt="App Logo"
          style={{ marginBottom: 18, borderRadius: 16, maxWidth: '100%', height: 'auto', display: 'block' }}
        />
        <div style={{
          fontFamily: FONT_FAMILY,
          fontSize: 28,
          color: '#fff',
          marginBottom: 10,
          letterSpacing: 1.2,
          textAlign: 'center',
          textShadow: '0 2px 8px #3b087355',
          fontWeight: 700,
        }}>
          Enter Access Code
        </div>
        <div style={{
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: 15,
          color: '#ecf0f1',
          marginBottom: 28,
          textAlign: 'center',
          opacity: 0.92,
        }}>
          Hey buddy, this casino is exclusive. Enter your 6-character code to unlock it.
        </div>
        <input
          ref={inputRef}
          type="text"
          value={code}
          onChange={handleInput}
          maxLength={6}
          autoFocus
          disabled={loading || success || showLoading}
          style={{
            width: 180,
            fontSize: 28,
            letterSpacing: 8,
            textAlign: 'center',
            padding: '14px 0',
            borderRadius: 16,
            border: error ? `2px solid ${ERROR_COLOR}` : `2px solid rgba(255,255,255,0.25)` ,
            outline: 'none',
            background: 'rgba(255,255,255,0.18)',
            color: '#fff',
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            marginBottom: 18,
            boxShadow: error
              ? `0 0 0 2px ${ERROR_COLOR}55`
              : '0 0 16px 4px #6913c555, 0 2px 12px #3b087355',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            caretColor: ACCENT_COLOR,
            animation: error ? 'shake 0.3s' : undefined,
            backdropFilter: 'blur(8px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(8px) saturate(1.2)',
          }}
          pattern="[A-Z0-9]{6}"
          inputMode="text"
          aria-label="Access code"
        />
        <button
          type="submit"
          disabled={loading || success || showLoading}
          style={{
            width: '100%',
            padding: '14px 0',
            borderRadius: 16,
            border: 'none',
            background: 'rgba(255,255,255,0.18)',
            color: '#fff',
            fontFamily: FONT_FAMILY,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 1.1,
            boxShadow: '0 2px 12px #3b087355',
            cursor: loading || success || showLoading ? 'not-allowed' : 'pointer',
            marginBottom: 10,
            marginTop: 2,
            transition: 'background 0.2s, box-shadow 0.2s',
            position: 'relative',
            outline: 'none',
            backdropFilter: 'blur(8px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(8px) saturate(1.2)',
            borderTop: `2.5px solid #fff3`,
            borderLeft: `2.5px solid #fff2`,
            borderRight: `2.5px solid #fff1`,
            borderBottom: `2.5px solid #fff1`,
          }}
        >
          {loading ? (
            <span style={{ display: 'inline-block', width: 22, height: 22, border: '3px solid #fff', borderTop: `3px solid ${ACCENT_COLOR}`, borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }} />
          ) : success ? (
            <span style={{ color: SUCCESS_COLOR, fontWeight: 700 }}>Success!</span>
          ) : (
            'Enter'
          )}
        </button>
        {error && (
          <div style={{ color: ERROR_COLOR, fontFamily: 'Inter, Arial, sans-serif', fontSize: 15, marginTop: 2, marginBottom: 2, minHeight: 24, textAlign: 'center', animation: 'fadeInError 0.3s' }}>{error}</div>
        )}
        <style>{`
          @keyframes fadeInEntryGate {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInGate {
            from { opacity: 0; transform: scale(0.96) translateY(24px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes shake {
            0% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
            100% { transform: translateX(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeInError {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </form>
    </div>
  );
};

export default EntryGate; 