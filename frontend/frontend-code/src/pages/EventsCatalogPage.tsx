import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, Filter, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { EventCard } from '../components/EventCard';
import { Badge } from '../components/ui/badge';
import { Event } from '../types';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { eventsService } from '../services/events.service';
import { registrationsService } from '../services/registrations.service';


const convertBackendEventToFrontendFormat = (apiEvent: any): Event => {
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
    attendees: apiEvent.attendee_count || 0,
    maxAttendees: apiEvent.capacity,
    organizer: apiEvent.organizer_email,
    organizerId: apiEvent.organizer_id,
    isRegistered: apiEvent.is_user_registered || false,
    registrationStatus: apiEvent.user_registration_status || null,
    status: apiEvent.status as any,
    createdAt: apiEvent.created_at,
    price: apiEvent.price || undefined, // Add price field from backend
  };
};



export function EventsCatalogPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load events from API on mount
  useEffect(() => {
    const loadEventsFromServer = async () => {
      try {
        setIsLoading(true);
        const catalogEvents = await eventsService.getCatalog();
        const eventsInFrontendFormat = catalogEvents.map(convertBackendEventToFrontendFormat);
        setEvents(eventsInFrontendFormat);
      } catch (err) {
        console.error('Failed to load events:', err);
        toast.error('Failed to load events');
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

  const handleToggleRSVP = useCallback(async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const isCancelling = event.isRegistered;
    const isWaitlisted = event.registrationStatus === 'waitlisted';
    const isPaidEvent = event.price && event.price > 0;

    // For paid events that user hasn't registered for, redirect to details page
    if (isPaidEvent && !isCancelling) {
      navigate(`/events/${eventId}`);
      return;
    }

    try {
      if (isCancelling) {
        // Cancel registration (works for both registered and waitlisted)
        await registrationsService.cancelRegistration(eventId);
        
        // Only decrement attendee count if user was registered (not waitlisted)
        const newAttendeeCount = event.registrationStatus === 'registered' 
          ? Math.max(0, event.attendees - 1) 
          : event.attendees;
        
        setEvents(events.map(e => 
          e.id === eventId ? { ...e, isRegistered: false, registrationStatus: null, attendees: newAttendeeCount } : e
        ));
        
        toast.success(isWaitlisted ? 'Waitlist Cancelled' : 'Registration Cancelled', {
          description: isWaitlisted 
            ? `You have been removed from the waitlist for "${event.title}"` 
            : `You have successfully cancelled your registration for "${event.title}"`,
          duration: 4000,
        });
      } else {
        // Register for event
        const response = await registrationsService.registerForEvent(eventId);
        
        const wasWaitlisted = response.status === 'waitlisted';
        
        setEvents(events.map(e => 
          e.id === eventId ? { 
            ...e, 
            isRegistered: true, 
            registrationStatus: wasWaitlisted ? 'waitlisted' : 'registered',
            attendees: wasWaitlisted ? e.attendees : e.attendees + 1 
          } : e
        ));
        
        if (wasWaitlisted) {
          toast.info('Added to Waitlist', {
            description: `You've been added to the waitlist for "${event.title}". We'll notify you if a spot opens up!`,
            duration: 5000,
          });
        } else {
          toast.success('Registration Confirmed! 🎉', {
            description: `You're all set for "${event.title}". Check your email for confirmation details.`,
            duration: 5000,
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle RSVP:', err);
      const errorMessage = err instanceof Error ? err.message : (isCancelling ? 'Failed to cancel' : 'Failed to register for event');
      
      toast.error(isCancelling ? 'Cancellation Failed' : 'Registration Failed', {
        description: errorMessage,
        duration: 4000,
      });
    }
  }, [events]);

  return (
    <div>
      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-64 overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1603857365671-93cd96dc1df8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYWVyaWFsfGVufDF8fHx8MTc2MzA4MTQ0Mnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Campus view"
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        >
          <Home className="w-4 h-4" />
          <Link to="/" className="hover:text-foreground">HOME</Link>
          <span>/</span>
          <span className="text-foreground">UPCOMING EVENTS</span>
        </motion.div>

        {/* Page Title and Action */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-[#E21833] dark:text-[#E21833]">Upcoming Events</h1>
        </motion.div>

        {/* Search and Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-muted/30 p-6 rounded-lg mb-8"
        >
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
            {[
              { label: 'Total Events', value: events.length },
              { label: 'My RSVPs', value: registeredEvents.length },
              { label: 'Available Spots', value: events.reduce((sum, e) => sum + (e.maxAttendees - e.attendees), 0) }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="bg-card p-4 rounded-lg shadow-sm border"
              >
                <div className="text-muted-foreground mb-1">{stat.label}</div>
                <div>{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
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
        </motion.div>

        {/* My RSVPs Section */}
        {registeredEvents.length > 0 && selectedCategory === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <h3>My Registered Events</h3>
              <Badge variant="secondary">{registeredEvents.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                >
                  <EventCard
                    event={event}
                    onToggleRSVP={handleToggleRSVP}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Events Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="mb-4">
            {selectedCategory === 'all' ? 'All Events' : `${selectedCategory} Events`}
          </h3>
          
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12 bg-card rounded-lg border"
            >
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Be the first to create an event!'}
              </p>
              <Link to="/create-event">
                <Button className="bg-[#E21833] hover:bg-[#C11528]">Create Event</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * (index % 9) }}
                  whileHover={{ y: -5 }}
                >
                  <EventCard
                    event={event}
                    onToggleRSVP={handleToggleRSVP}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}