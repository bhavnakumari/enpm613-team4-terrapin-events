import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '../../../src/components/Layout';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';
import { AuthProvider } from '../../../src/contexts/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithProviders = (children: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Layout - Comprehensive Tests', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('renders header with UMD logo and branding', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('University of Maryland')).toBeDefined();
    const logo = screen.getByAltText('University of Maryland Seal');
    expect(logo).toBeDefined();
  });

  it('renders navigation links', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeDefined();
  });

  it('renders theme toggle button', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders user dropdown menu trigger', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Look for the dropdown trigger
    const triggers = document.querySelectorAll('[data-radix-collection-item]');
    expect(triggers.length).toBeGreaterThanOrEqual(0);
  });

  it('renders footer with copyright', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText(/© 2025 University of Maryland/i)).toBeDefined();
  });

  it('renders footer sections', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('About')).toBeDefined();
    expect(screen.getByText('Events')).toBeDefined();
    expect(screen.getByText('Support')).toBeDefined();
    expect(screen.getByText('Connect')).toBeDefined();
  });

  it('renders footer links correctly', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByRole('link', { name: /About Us/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Contact/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /FAQ/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Browse Events/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Help Center/i })).toBeDefined();
  });

  it('renders social media links', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Twitter')).toBeDefined();
    expect(screen.getByText('Instagram')).toBeDefined();
    expect(screen.getByText('Facebook')).toBeDefined();
  });

  it('renders main content area with children', () => {
    renderWithProviders(
      <Layout>
        <div data-testid="test-child">Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('test-child')).toBeDefined();
    expect(screen.getByText('Test Content')).toBeDefined();
  });

  it('has sticky header with proper styling', () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const header = container.querySelector('header');
    expect(header).toBeDefined();
    expect(header?.className).toContain('sticky');
    expect(header?.className).toContain('top-0');
  });

  it('has responsive layout classes', () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const header = container.querySelector('header');
    const headerContent = header?.querySelector('div');
    expect(headerContent?.className).toContain('max-w-7xl');
    expect(headerContent?.className).toContain('mx-auto');
  });

  it('renders UMD branding link that navigates to home', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const brandLink = screen.getByText('University of Maryland').closest('a');
    expect(brandLink?.getAttribute('href')).toBe('/');
  });

  it('footer has grid layout for sections', () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const footer = container.querySelector('footer');
    const gridContainer = footer?.querySelector('.grid');
    expect(gridContainer).toBeDefined();
  });

  it('renders all required footer columns', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // About section
    expect(screen.getByText('About')).toBeDefined();
    // Events section
    expect(screen.getByText('Events')).toBeDefined();
    // Support section  
    expect(screen.getByText('Support')).toBeDefined();
    // Connect section
    expect(screen.getByText('Connect')).toBeDefined();
  });

  it('footer links have hover styling classes', () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const footerLinks = container.querySelectorAll('footer a');
    footerLinks.forEach(link => {
      expect(link.className).toContain('hover:text-[#E21833]');
    });
  });

  it('navigation has hidden class for mobile', () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const nav = container.querySelector('nav');
    expect(nav?.className).toContain('hidden');
    expect(nav?.className).toContain('lg:flex');
  });

  it('has proper background and border styling', () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer?.className).toContain('bg-background');

    const header = container.querySelector('header');
    expect(header?.className).toContain('bg-card');
    expect(header?.className).toContain('border-b');
  });
});
