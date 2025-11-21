import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Ticket, Mail, Phone, User, Edit, Settings, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api-client';
import { eventsService } from '../services/events.service';

interface RegisteredEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  category: string;
  ticketNumber: string;
  registeredAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

/* MOCK DATA - COMMENTED OUT (Using Real API Now)
const mockRegistrations: RegisteredEvent[] = [
  {
    id: '1',
    title: 'Annual Tech Symposium 2025',
    date: 'December 15, 2025',
    time: '9:00 AM - 5:00 PM',
    location: 'Main Auditorium, Building A',
    imageUrl: 'https://images.unsplash.com/photo-1760420940953-3958ad9f6287?w=400',
    category: 'Academic',
    ticketNumber: 'TS-2025-001234',
    registeredAt: 'November 10, 2025',
    status: 'confirmed',
  },
  {
    id: '2',
    title: 'Welcome Week Social Mixer',
    date: 'November 20, 2025',
    time: '6:00 PM - 9:00 PM',
    location: 'Student Center Plaza',
    imageUrl: 'https://images.unsplash.com/photo-1632834380561-d1e05839a33a?w=400',
    category: 'Social',
    ticketNumber: 'WW-2025-005678',
    registeredAt: 'November 5, 2025',
    status: 'confirmed',
  },
  {
    id: '3',
    title: 'Web Development Workshop',
    date: 'December 1, 2025',
    time: '3:00 PM - 6:00 PM',
    location: 'Computer Lab 301',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    category: 'Workshop',
    ticketNumber: 'WD-2025-009012',
    registeredAt: 'November 12, 2025',
    status: 'confirmed',
  },
];
*/

export function UserProfilePage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegisteredEvent[]>([]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const regsWithEvents = await apiClient.get<any[]>('/api/events/registrations/my-registrations-with-events');
        const events = regsWithEvents.map(r => {
          const e = r.event_details;
          return {
            id: r.event_id,
            title: e.title,
            date: new Date(e.start_time).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            time: new Date(e.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            location: e.location,
            imageUrl: e.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
            category: e.category?.charAt(0).toUpperCase() + e.category?.slice(1) || 'Event',
            ticketNumber: r.registration_id,
            registeredAt: new Date(r.registered_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: r.status === 'registered' ? 'confirmed' as const : 'pending' as const,
          };
        });
        setRegistrations(events);
      } catch (err) {
        console.error('Failed to fetch registrations:', err);
      }
    };
    fetchRegistrations();
  }, []);

  const upcomingEvents = registrations.filter(e => e.status === 'confirmed');
  const pastEvents: RegisteredEvent[] = [];

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src="" />
              <AvatarFallback className="bg-[#E21833] text-white text-2xl">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="mb-2">{user?.first_name} {user?.last_name}</h1>
              <p className="text-muted-foreground mb-4">{user?.role}{user?.major && ` • ${user.major}`}{user?.year && ` • Class of ${user.year}`}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Registrations</p>
                <p className="text-foreground">{registrations.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#E21833]/10 dark:bg-[#C11528]/20 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-[#E21833]" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Upcoming Events</p>
                <p className="text-foreground">{upcomingEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#E21833]/10 dark:bg-[#C11528]/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#E21833]" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Events Attended</p>
                <p className="text-foreground">{pastEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#E21833]/10 dark:bg-[#C11528]/20 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-[#E21833]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Event Registrations */}
        <Card className="p-6">
          <h2 className="mb-6">My Event Registrations</h2>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Event Image */}
                    <div className="w-full lg:w-48 h-48 lg:h-auto rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3>{event.title}</h3>
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                              {event.status}
                            </Badge>
                          </div>
                          <Badge variant="outline">{event.category}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm">Date</p>
                            <p className="text-sm text-muted-foreground">{event.date}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm">Time</p>
                            <p className="text-sm text-muted-foreground">{event.time}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm">Location</p>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Ticket className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm">Ticket Number</p>
                            <p className="text-sm text-muted-foreground font-mono">{event.ticketNumber}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-wrap gap-2">
                        <Link to={`/events/${event.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Ticket
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Cancel Registration
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {upcomingEvents.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground mb-4">You haven't registered for any events yet</p>
                  <Link to="/events">
                    <Button className="bg-[#E21833] hover:bg-[#C11528]">Browse Events</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">No past events</h3>
                <p className="text-muted-foreground">Events you've attended will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
