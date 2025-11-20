import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, Filter, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { EventCard } from '../components/EventCard';
import { Badge } from '../components/ui/badge';
import { Event } from '../types';

// Mock data for initial events
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
  {
    id: '2',
    title: 'Welcome Week Social Mixer',
    description: 'Meet new friends and connect with fellow students! Enjoy food, music, and fun activities. Perfect for freshmen and transfer students.',
    category: 'Social',
    date: 'November 20, 2025',
    time: '6:00 PM - 9:00 PM',
    location: 'Student Center Plaza',
    imageUrl: 'https://images.unsplash.com/photo-1632834380561-d1e05839a33a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzYzMDcyMjI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    attendees: 87,
    maxAttendees: 150,
    organizer: 'Student Council',
    organizerId: 'org-2',
    isRegistered: true,
    status: 'approved',
    createdAt: '2025-10-15',
  },
  {
    id: '3',
    title: 'Intramural Basketball Tournament',
    description: 'Show off your skills in our annual basketball tournament. Teams of 5 compete for the championship trophy and bragging rights!',
    category: 'Sports',
    date: 'November 25, 2025',
    time: '2:00 PM - 8:00 PM',
    location: 'Recreation Center Courts',
    imageUrl: 'https://images.unsplash.com/photo-1762709753300-342ab94e8b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwc3BvcnRzJTIwZXZlbnR8ZW58MXx8fHwxNzYzMTc1MzU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    attendees: 96,
    maxAttendees: 100,
    organizer: 'Athletics Department',
    organizerId: 'org-3',
    isRegistered: false,
    status: 'approved',
    createdAt: '2025-10-20',
  },
  {
    id: '4',
    title: 'Web Development Workshop',
    description: 'Learn modern web development with React, Next.js, and Tailwind CSS. Hands-on coding session with experienced developers.',
    category: 'Workshop',
    date: 'December 1, 2025',
    time: '3:00 PM - 6:00 PM',
    location: 'Computer Lab 301',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjMxNzUzNTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    attendees: 28,
    maxAttendees: 30,
    organizer: 'Tech Society',
    organizerId: 'org-4',
    isRegistered: true,
    status: 'approved',
    createdAt: '2025-11-05',
  },
  {
    id: '5',
    title: 'Cultural Night: Global Flavors',
    description: 'Experience cultures from around the world through food, dance, and music. Celebrate diversity with performances and cuisine from 20+ countries.',
    category: 'Cultural',
    date: 'December 10, 2025',
    time: '7:00 PM - 10:00 PM',
    location: 'Grand Hall',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxjdWx0dXJhbCUyMGZlc3RpdmFsfGVufDF8fHx8MTc2MzE3NTM1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    attendees: 234,
    maxAttendees: 300,
    organizer: 'International Students Association',
    organizerId: 'org-5',
    isRegistered: false,
    status: 'approved',
    createdAt: '2025-10-25',
  },
  {
    id: '6',
    title: 'Career Fair 2025',
    description: 'Network with top employers and explore internship and full-time opportunities. Bring your resume and dress professionally!',
    category: 'Career',
    date: 'December 5, 2025',
    time: '10:00 AM - 4:00 PM',
    location: 'Exhibition Center',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjYXJlZXIlMjBmYWlyJTIwam9ifGVufDF8fHx8MTc2MzE3NTM1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    attendees: 412,
    maxAttendees: 500,
    organizer: 'Career Services',
    organizerId: 'org-6',
    isRegistered: false,
    status: 'approved',
    price: 0,
    createdAt: '2025-10-10',
  },
];

export function EventsCatalogPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  const registeredEvents = events.filter(e => e.isRegistered);

  const handleToggleRSVP = (eventId: string) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        const isRegistering = !event.isRegistered;
        return {
          ...event,
          isRegistered: isRegistering,
          attendees: isRegistering ? event.attendees + 1 : Math.max(0, event.attendees - 1),
        };
      }
      return event;
    }));
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

        {/* Page Title and Action */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[#E21833] dark:text-[#E21833]">Upcoming Events</h1>
          <Link to="/create-event">
            <Button className="gap-2 bg-[#E21833] hover:bg-[#C11528]">
              <Plus className="w-5 h-5" />
              Create Event
            </Button>
          </Link>
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
          
          {filteredEvents.length === 0 ? (
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
