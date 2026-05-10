/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider } from './lib/context';
import { Layout } from './Layout';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex flex-col items-center justify-center p-8">
          <h1 className="text-2xl font-bold mb-4 text-[#ef4444]">Đã có lỗi xảy ra!</h1>
          <pre className="p-4 bg-black/50 rounded-xl overflow-auto max-w-full text-xs text-[#94a3b8] mb-6">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-[#38bdf8] text-[#0f172a] rounded-xl font-bold"
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Layout />
      </AppProvider>
    </ErrorBoundary>
  );
}

