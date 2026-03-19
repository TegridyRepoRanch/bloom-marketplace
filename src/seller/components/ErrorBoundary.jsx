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
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          background: colors.cream,
        }}>
          <div style={{ maxWidth: 500, textAlign: 'center' }}>
            <div className="animate-float" style={{ fontSize: 64, marginBottom: 20 }}>⚠️</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.dark, marginBottom: 12 }}>
              Something went wrong / เกิดข้อผิดพลาด
            </h1>
            <p style={{ color: colors.gray, marginBottom: 24, lineHeight: 1.6 }}>
              An unexpected error occurred. Please try refreshing the page.<br/>เกิดข้อผิดพลาด กรุณาโหลดหน้าใหม่
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Refresh Page / โหลดใหม่
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

