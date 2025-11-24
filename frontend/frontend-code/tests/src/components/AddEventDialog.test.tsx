import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddEventDialog } from '../../../src/components/AddEventDialog';
import userEvent from '@testing-library/user-event';

describe('AddEventDialog', () => {
  it('renders when open', () => {
    const onOpenChange = vi.fn();
    const onAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={onOpenChange} 
        onAddEvent={onAddEvent} 
      />
    );

    expect(screen.getByText('Create New Event')).toBeDefined();
  });

  it('does not render when closed', () => {
    const onOpenChange = vi.fn();
    const onAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={false} 
        onOpenChange={onOpenChange} 
        onAddEvent={onAddEvent} 
      />
    );

    expect(screen.queryByText('Create New Event')).toBeNull();
  });

  it('renders form fields', async () => {
    const onOpenChange = vi.fn();
    const onAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={onOpenChange} 
        onAddEvent={onAddEvent} 
      />
    );

    // Check that all form fields are present
    expect(screen.getByLabelText(/Event Title/i)).toBeDefined();
    expect(screen.getByLabelText(/Description/i)).toBeDefined();
    expect(screen.getByLabelText(/Location/i)).toBeDefined();
    expect(screen.getByLabelText(/Max Attendees/i)).toBeDefined();
  });

  it('calls onOpenChange when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={onOpenChange} 
        onAddEvent={onAddEvent} 
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
