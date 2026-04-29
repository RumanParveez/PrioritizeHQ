import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  label: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.label}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Something went wrong in {this.props.label}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '8px 16px', fontSize: '0.8125rem', fontWeight: 500, border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent-primary)', color: '#fff', cursor: 'pointer' }}
            >
              Reload
            </button>
            <a
              href="mailto:support@prioritizehq.app?subject=Bug%20Report"
              style={{ padding: '8px 16px', fontSize: '0.8125rem', fontWeight: 500, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', textDecoration: 'none' }}
            >
              Report issue
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
