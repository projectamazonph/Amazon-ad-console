'use client';

import React from 'react';
import { Button } from '@astryxdesign/core/Button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-content">
          <div className="error-state" style={{ maxWidth: 500, margin: '80px auto' }}>
            <span className="icon">⚠️</span>
            <h3>Something went wrong</h3>
            <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <Button
              label="Reload app"
              variant="primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
