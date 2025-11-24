import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventDetailsDialog } from '../../../src/components/EventDetailsDialog';
import { Event } from '../../../src/types';

const mockEvent: Event = {
  id: '1',
  title: 'Test Event',
  description: 'Test Description',
  category: 'Academic',
  date: '2024-12-01',
  time: '10:00 AM',
  location: 'Test Location',
  imageUrl: 'https://test.com/image.jpg',
  maxAttendees: 100,
  attendees: 50,
  organizer: 'Test Organizer',
  organizerId: 'org-1',
  status: 'approved',
  createdAt: '2024-01-01',
};

describe('EventDetailsDialog', () => {
  it('renders event details when open', () => {
    const onOpenChange = vi.fn();
    const onToggleRSVP = vi.fn();

    render(
      <EventDetailsDialog 
        event={mockEvent} 
        open={true} 
        onOpenChange={onOpenChange} 
        onToggleRSVP={onToggleRSVP}
      />
    );

    expect(screen.getByText('Test Event')).toBeDefined();
    expect(screen.getByText('Test Description')).toBeDefined();
    expect(screen.getByText('Test Location')).toBeDefined();
  });

  it('does not render when closed', () => {
    const onOpenChange = vi.fn();
    const onToggleRSVP = vi.fn();

    render(
      <EventDetailsDialog 
        event={mockEvent} 
        open={false} 
        onOpenChange={onOpenChange} 
        onToggleRSVP={onToggleRSVP}
      />
    );

    expect(screen.queryByText('Test Event')).toBeNull();
  });

  it('returns null when event is null', () => {
    const onOpenChange = vi.fn();
    const onToggleRSVP = vi.fn();

    const { container } = render(
      <EventDetailsDialog 
        event={null} 
        open={true} 
        onOpenChange={onOpenChange} 
        onToggleRSVP={onToggleRSVP}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows spots left information', () => {
    const onOpenChange = vi.fn();
    const onToggleRSVP = vi.fn();

    render(
      <EventDetailsDialog 
        event={mockEvent} 
        open={true} 
        onOpenChange={onOpenChange} 
        onToggleRSVP={onToggleRSVP}
      />
    );

    expect(screen.getByText(/50.*\/.*100/)).toBeDefined();
  });

  it('calls onToggleRSVP when RSVP button clicked', () => {
    const onOpenChange = vi.fn();
    const onToggleRSVP = vi.fn();

    render(
      <EventDetailsDialog 
        event={mockEvent} 
        open={true} 
        onOpenChange={onOpenChange} 
        onToggleRSVP={onToggleRSVP}
      />
    );

    const rsvpButton = screen.getByRole('button', { name: /Register Now/i });
    fireEvent.click(rsvpButton);

    expect(onToggleRSVP).toHaveBeenCalledWith('1');
  });

  it('shows full message when event is at capacity', () => {
    const onOpenChange = vi.fn();
    const onToggleRSVP = vi.fn();
    const fullEvent = { ...mockEvent, attendees: 100 };

    render(
      <EventDetailsDialog 
        event={fullEvent} 
        open={true} 
        onOpenChange={onOpenChange} 
        onToggleRSVP={onToggleRSVP}
      />
    );

    expect(screen.getByText(/Event Full/i)).toBeDefined();
  });
});
