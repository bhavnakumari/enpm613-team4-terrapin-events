import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../../../src/contexts/ThemeContext';

// Test component that uses the theme context
function TestComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('provides initial light theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('loads saved theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('adds dark class to document when dark theme is loaded', () => {
    localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme from light to dark', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('light');

    const toggleButton = screen.getByText('Toggle Theme');
    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });

    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme from dark to light', async () => {
    const user = userEvent.setup();
    localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');

    const toggleButton = screen.getByText('Toggle Theme');
    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('light');
    });

    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists theme changes to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByText('Toggle Theme');
    
    // Toggle to dark
    await user.click(toggleButton);
    expect(localStorage.getItem('theme')).toBe('dark');

    // Toggle back to light
    await user.click(toggleButton);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('throws error when useTheme is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within ThemeProvider');

    console.error = originalError;
  });

  it('updates document class correctly on multiple toggles', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByText('Toggle Theme');

    // First toggle - to dark
    await user.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Second toggle - back to light
    await user.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Third toggle - to dark again
    await user.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
