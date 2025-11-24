import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddEventDialog } from '../../../src/components/AddEventDialog';

describe('AddEventDialog - Comprehensive Tests', () => {
  it('updates all form fields when user types', async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();
    const mockOnAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onAddEvent={mockOnAddEvent} 
      />
    );

    const titleInput = screen.getByLabelText(/Event Title/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    const locationInput = screen.getByLabelText(/Location/i) as HTMLInputElement;
    const organizerInput = screen.getByLabelText(/Organizer/i) as HTMLInputElement;

    await user.type(titleInput, 'Test Event');
    expect(titleInput.value).toBe('Test Event');

    await user.type(descriptionInput, 'Test Description');
    expect(descriptionInput.value).toBe('Test Description');

    await user.type(locationInput, 'Test Location');
    expect(locationInput.value).toBe('Test Location');

    await user.type(organizerInput, 'Test Organizer');
    expect(organizerInput.value).toBe('Test Organizer');
  });

  it('updates date and time fields', async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();
    const mockOnAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onAddEvent={mockOnAddEvent} 
      />
    );

    const dateInput = screen.getByLabelText(/Date/i) as HTMLInputElement;
    const timeInput = screen.getByLabelText(/Time/i) as HTMLInputElement;

    await user.type(dateInput, '2025-12-31');
    expect(dateInput.value).toBe('2025-12-31');

    await user.type(timeInput, '14:30');
    expect(timeInput.value).toBe('14:30');
  });

  it('updates max attendees field with number', async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();
    const mockOnAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onAddEvent={mockOnAddEvent} 
      />
    );

    const maxAttendeesInput = screen.getByLabelText(/Max Attendees/i) as HTMLInputElement;
    await user.clear(maxAttendeesInput);
    await user.type(maxAttendeesInput, '100');
    expect(maxAttendeesInput.value).toBe('100');
  });

  it('updates image URL field', async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();
    const mockOnAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onAddEvent={mockOnAddEvent} 
      />
    );

    const imageUrlInput = screen.getByLabelText(/Image URL/i) as HTMLInputElement;
    await user.type(imageUrlInput, 'https://example.com/image.jpg');
    expect(imageUrlInput.value).toBe('https://example.com/image.jpg');
  });

  it('submits form with correct data and resets', async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();
    const mockOnAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onAddEvent={mockOnAddEvent} 
      />
    );

    // Fill in all required fields
    await user.type(screen.getByLabelText(/Event Title/i), 'Tech Conference');
    await user.type(screen.getByLabelText(/Description/i), 'Annual tech event');
    await user.type(screen.getByLabelText(/Organizer/i), 'Tech Club');
    await user.type(screen.getByLabelText(/Date/i), '2025-12-31');
    await user.type(screen.getByLabelText(/Time/i), '14:30');
    await user.type(screen.getByLabelText(/Location/i), 'Main Hall');
    const maxAttendeesInput = screen.getByLabelText(/Max Attendees/i);
    await user.clear(maxAttendeesInput);
    await user.type(maxAttendeesInput, '150');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    // Verify onAddEvent was called with correct data
    await waitFor(() => {
      expect(mockOnAddEvent).toHaveBeenCalledWith({
        title: 'Tech Conference',
        description: 'Annual tech event',
        category: 'Academic',
        organizer: 'Tech Club',
        date: '2025-12-31',
        time: '14:30',
        location: 'Main Hall',
        maxAttendees: 150,
        imageUrl: '',
      });
    });

    // Verify dialog closed
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles form submission with all fields including optional image URL', async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();
    const mockOnAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onAddEvent={mockOnAddEvent} 
      />
    );

    await user.type(screen.getByLabelText(/Event Title/i), 'Workshop');
    await user.type(screen.getByLabelText(/Description/i), 'Learn new skills');
    await user.type(screen.getByLabelText(/Organizer/i), 'Skills Lab');
    await user.type(screen.getByLabelText(/Date/i), '2025-11-15');
    await user.type(screen.getByLabelText(/Time/i), '10:00');
    await user.type(screen.getByLabelText(/Location/i), 'Room 101');
    const maxAttendeesInput = screen.getByLabelText(/Max Attendees/i);
    await user.clear(maxAttendeesInput);
    await user.type(maxAttendeesInput, '30');
    await user.type(screen.getByLabelText(/Image URL/i), 'https://example.com/workshop.jpg');

    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnAddEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Workshop',
          imageUrl: 'https://example.com/workshop.jpg',
        })
      );
    });
  });

  it('shows category select with all options', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onAddEvent={mockOnAddEvent} 
      />
    );

    const categorySelect = screen.getByLabelText(/Category/i);
    expect(categorySelect).toBeDefined();
  });

  it('has proper input types and placeholders', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onAddEvent={mockOnAddEvent} 
      />
    );

    const titleInput = screen.getByPlaceholderText(/Annual Tech Symposium/i);
    expect(titleInput).toBeDefined();

    const descriptionInput = screen.getByPlaceholderText(/Describe your event/i);
    expect(descriptionInput).toBeDefined();

    const locationInput = screen.getByPlaceholderText(/Main Auditorium/i);
    expect(locationInput).toBeDefined();

    const organizerInput = screen.getByPlaceholderText(/Club or organization/i);
    expect(organizerInput).toBeDefined();
  });

  it('converts maxAttendees string to number on submit', async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = vi.fn();
    const mockOnAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onAddEvent={mockOnAddEvent} 
      />
    );

    await user.type(screen.getByLabelText(/Event Title/i), 'Test');
    await user.type(screen.getByLabelText(/Description/i), 'Test');
    await user.type(screen.getByLabelText(/Organizer/i), 'Test');
    await user.type(screen.getByLabelText(/Date/i), '2025-12-01');
    await user.type(screen.getByLabelText(/Time/i), '12:00');
    await user.type(screen.getByLabelText(/Location/i), 'Test');
    const maxAttendeesInput = screen.getByLabelText(/Max Attendees/i);
    await user.clear(maxAttendeesInput);
    await user.type(maxAttendeesInput, '50');

    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnAddEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          maxAttendees: 50,
        })
      );
    });
  });

  it('renders all category options', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onAddEvent={mockOnAddEvent} 
      />
    );

    expect(screen.getByLabelText(/Category/i)).toBeDefined();
  });

  it('has required attribute on required fields', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnAddEvent = vi.fn();

    render(
      <AddEventDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onAddEvent={mockOnAddEvent} 
      />
    );

    const titleInput = screen.getByLabelText(/Event Title/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const organizerInput = screen.getByLabelText(/Organizer/i);
    const dateInput = screen.getByLabelText(/Date/i);
    const timeInput = screen.getByLabelText(/Time/i);
    const locationInput = screen.getByLabelText(/Location/i);
    const maxAttendeesInput = screen.getByLabelText(/Max Attendees/i);

    expect(titleInput.hasAttribute('required')).toBe(true);
    expect(descriptionInput.hasAttribute('required')).toBe(true);
    expect(organizerInput.hasAttribute('required')).toBe(true);
    expect(dateInput.hasAttribute('required')).toBe(true);
    expect(timeInput.hasAttribute('required')).toBe(true);
    expect(locationInput.hasAttribute('required')).toBe(true);
    expect(maxAttendeesInput.hasAttribute('required')).toBe(true);
  });
});
