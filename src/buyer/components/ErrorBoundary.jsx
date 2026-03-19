import React from 'react';
import { colors } from '../../shared/theme';

// =============================================
// ERROR BOUNDARY
// =============================================
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Error details intentionally not logged to prevent info leaks in production
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.cream,
          padding: 24,
        }}>
          <span style={{ fontSize: 80, marginBottom: 20 }} aria-hidden="true">⚠️</span>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: colors.dark, marginBottom: 16, textAlign: 'center' }}>
            Something went wrong / เกิดข้อผิดพลาด
          </h1>
          <p style={{ fontSize: 16, color: colors.gray, marginBottom: 32, textAlign: 'center', maxWidth: 500 }}>
            We're sorry for the inconvenience. Please reload the page.<br/>ขออภัยในความไม่สะดวก กรุณาโหลดหน้าใหม่
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '16px 40px',
              background: colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: 25,
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            Reload Page / โหลดใหม่
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
