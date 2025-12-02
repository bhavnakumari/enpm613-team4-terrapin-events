import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '../../../src/components/Layout';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';

describe('Layout', () => {
  it('renders children correctly', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Test Content')).toBeDefined();
  });

  it('renders navigation header', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('University of Maryland')).toBeDefined();
  });

  it('renders footer', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/© 2025 University of Maryland/i)).toBeDefined();
  });
});
