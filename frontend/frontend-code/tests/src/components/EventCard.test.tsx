import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EventCard } from '../../../src/components/EventCard';
import { Event } from '../../../src/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe('EventCard', () => {
  it('renders event details correctly', () => {
    const onToggleRSVP = vi.fn();
    
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} onToggleRSVP={onToggleRSVP} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Event')).toBeDefined();
    expect(screen.getByText('Test Location')).toBeDefined();
    expect(screen.getByText('10:00 AM')).toBeDefined();
    expect(screen.getByText('50 / 100 attendees')).toBeDefined();
  });

  it('shows almost full badge when spots are low', () => {
    const onToggleRSVP = vi.fn();
    const almostFullEvent = { ...mockEvent, attendees: 95 };
    
    render(
      <BrowserRouter>
        <EventCard event={almostFullEvent} onToggleRSVP={onToggleRSVP} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Almost full!/i)).toBeDefined();
  });

  it('shows full badge when no spots left', () => {
    const onToggleRSVP = vi.fn();
    const fullEvent = { ...mockEvent, attendees: 100 };
    
    render(
      <BrowserRouter>
        <EventCard event={fullEvent} onToggleRSVP={onToggleRSVP} />
      </BrowserRouter>
    );

    expect(screen.getByText(/\(Full\)/i)).toBeDefined();
  });

  it('calls onToggleRSVP when RSVP button clicked for free event', () => {
    const onToggleRSVP = vi.fn();
    
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} onToggleRSVP={onToggleRSVP} />
      </BrowserRouter>
    );

    const rsvpButton = screen.getByRole('button', { name: /RSVP/i });
    fireEvent.click(rsvpButton);

    expect(onToggleRSVP).toHaveBeenCalledWith('1');
  });

  it('navigates to event details for paid events', () => {
    const onToggleRSVP = vi.fn();
    const paidEvent = { ...mockEvent, price: 10 };
    
    render(
      <BrowserRouter>
        <EventCard event={paidEvent} onToggleRSVP={onToggleRSVP} />
      </BrowserRouter>
    );

    const rsvpButton = screen.getByRole('button', { name: /RSVP/i });
    fireEvent.click(rsvpButton);

    expect(mockNavigate).toHaveBeenCalledWith('/events/1');
    expect(onToggleRSVP).not.toHaveBeenCalled();
  });

  it('shows waitlist button when event is full', () => {
    const onToggleRSVP = vi.fn();
    const fullEvent = { ...mockEvent, attendees: 100 };
    
    render(
      <BrowserRouter>
        <EventCard event={fullEvent} onToggleRSVP={onToggleRSVP} />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Join Waitlist/i })).toBeDefined();
  });

  it('shows cancel RSVP when already registered', () => {
    const onToggleRSVP = vi.fn();
    const registeredEvent = { ...mockEvent, registrationStatus: 'registered' as const };
    
    render(
      <BrowserRouter>
        <EventCard event={registeredEvent} onToggleRSVP={onToggleRSVP} />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Cancel RSVP/i })).toBeDefined();
  });

  it('navigates to event details when View Details clicked', () => {
    const onToggleRSVP = vi.fn();
    
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} onToggleRSVP={onToggleRSVP} />
      </BrowserRouter>
    );

    const viewDetailsButton = screen.getByRole('button', { name: /View Details/i });
    fireEvent.click(viewDetailsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/events/1');
  });
});
