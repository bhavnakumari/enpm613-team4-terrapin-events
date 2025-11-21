import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, Filter, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { EventCard } from '../components/EventCard';
import { Badge } from '../components/ui/badge';
import { Event } from '../types';
import { eventsService } from '../services/events.service';
import { apiClient } from '../lib/api-client';
import type { Event as BackendEvent } from '../types/event';


const convertBackendEventToFrontendFormat = (apiEvent: BackendEvent): Event => {
  const eventStartDate = new Date(apiEvent.start_time);
  const eventEndDate = apiEvent.end_time ? new Date(apiEvent.end_time) : null;
  
  const categoryCapitalized = apiEvent.category 
    ? (apiEvent.category.charAt(0).toUpperCase() + apiEvent.category.slice(1)) as any
    : 'Academic';
  
  return {
    id: apiEvent.event_id,
    title: apiEvent.title,
    description: apiEvent.description || '',
    category: categoryCapitalized,
    location: apiEvent.location,
    
    date: eventStartDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    

    time: eventEndDate 
      ? `${eventStartDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${eventEndDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
      : eventStartDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    
    imageUrl: apiEvent.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    attendees: 0, // TODO: Get from registrations API later
    maxAttendees: apiEvent.capacity, // Backend calls it "capacity", frontend calls it "maxAttendees"
    organizer: apiEvent.organizer_email,
    organizerId: apiEvent.organizer_id,
    isRegistered: false, // TODO: Check if current user registered (from registrations API)
    status: apiEvent.status as any,
    createdAt: apiEvent.created_at,
  };
};

// ==========================================
// MOCK DATA (COMMENTED OUT - Using Real API Now)
// ==========================================
/*
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Annual Tech Symposium 2025',
    description: 'Join us for a day of innovation and technology talks featuring industry leaders and cutting-edge research presentations.',
    category: 'Academic',
    date: 'December 15, 2025',
    time: '9:00 AM - 5:00 PM',
    location: 'Main Auditorium, Building A',
    imageUrl: 'https://images.unsplash.com/photo-1760420940953-3958ad9f6287?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwY29uZmVyZW5jZSUyMHdvcmtzaG9wfGVufDF8fHx8MTc2MzE3NTM1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    attendees: 145,
    maxAttendees: 200,
    organizer: 'Computer Science Club',
    organizerId: 'org-1',
    isRegistered: false,
    status: 'approved',
    createdAt: '2025-11-01',
  },
];
*/
// ==========================================

export function EventsCatalogPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch events from backend API when page loads
  useEffect(() => {
    const loadEventsFromServer = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const eventsFromAPI = await eventsService.getEventsByStatus('approved');
        const eventsInFrontendFormat = eventsFromAPI.map(convertBackendEventToFrontendFormat);
        
        setEvents(eventsInFrontendFormat);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEventsFromServer();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  const registeredEvents = events.filter(e => e.isRegistered);

  const handleToggleRSVP = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    try {
      if (event.isRegistered) {
        // Cancel registration
        await apiClient.delete(`/api/events/${eventId}/register`);
        setEvents(events.map(e => 
          e.id === eventId ? { ...e, isRegistered: false, attendees: Math.max(0, e.attendees - 1) } : e
        ));
      } else {
        // Register for event
        await apiClient.post(`/api/events/${eventId}/register`, {});
        setEvents(events.map(e => 
          e.id === eventId ? { ...e, isRegistered: true, attendees: e.attendees + 1 } : e
        ));
      }
    } catch (err) {
      console.error('Failed to toggle RSVP:', err);
      alert(err instanceof Error ? err.message : 'Failed to update registration');
    }
  };

  const handleViewDetails = (event: Event) => {
    // Navigate to event details page
    window.location.href = `/events/${event.id}`;
  };

  return (
    <div>
      {/* Hero Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1603857365671-93cd96dc1df8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYWVyaWFsfGVufDF8fHx8MTc2MzA4MTQ0Mnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Campus view"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Home className="w-4 h-4" />
          <Link to="/" className="hover:text-foreground">HOME</Link>
          <span>/</span>
          <span className="text-foreground">UPCOMING EVENTS</span>
        </div>

        {/* Search and Stats */}
        <div className="bg-muted/30 p-6 rounded-lg mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-lg shadow-sm border">
              <div className="text-muted-foreground mb-1">Total Events</div>
              <div>{events.length}</div>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm border">
              <div className="text-muted-foreground mb-1">My RSVPs</div>
              <div>{registeredEvents.length}</div>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm border">
              <div className="text-muted-foreground mb-1">Available Spots</div>
              <div>
                {events.reduce((sum, e) => sum + (e.maxAttendees - e.attendees), 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3>Filter by Category</h3>
          </div>
          <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#E21833] data-[state=active]:text-white">
              All Events
            </TabsTrigger>
            <TabsTrigger value="Academic" className="data-[state=active]:bg-[#E21833] data-[state=active]:text-white">
              Academic
            </TabsTrigger>
            <TabsTrigger value="Social" className="data-[state=active]:bg-[#E21833] data-[state=active]:text-white">
              Social
            </TabsTrigger>
            <TabsTrigger value="Sports" className="data-[state=active]:bg-[#E21833] data-[state=active]:text-white">
              Sports
            </TabsTrigger>
            <TabsTrigger value="Workshop" className="data-[state=active]:bg-[#E21833] data-[state=active]:text-white">
              Workshop
            </TabsTrigger>
            <TabsTrigger value="Cultural" className="data-[state=active]:bg-[#E21833] data-[state=active]:text-white">
              Cultural
            </TabsTrigger>
            <TabsTrigger value="Career" className="data-[state=active]:bg-[#E21833] data-[state=active]:text-white">
              Career
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* My RSVPs Section */}
        {registeredEvents.length > 0 && selectedCategory === 'all' && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h3>My Registered Events</h3>
              <Badge variant="secondary">{registeredEvents.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                  onToggleRSVP={handleToggleRSVP}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Events Section */}
        <div>
          <h3 className="mb-4">
            {selectedCategory === 'all' ? 'All Events' : `${selectedCategory} Events`}
          </h3>
          
          {isLoading ? (
            <div className="text-center py-12 bg-card rounded-lg border">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E21833] mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="text-center py-12 bg-card rounded-lg border border-red-200">
              <Calendar className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="mb-2 text-red-600">Failed to load events</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-[#E21833] hover:bg-[#C11528]"
              >
                Retry
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Be the first to create an event!'}
              </p>
              <Link to="/create-event">
                <Button className="bg-[#E21833] hover:bg-[#C11528]">Create Event</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                  onToggleRSVP={handleToggleRSVP}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
