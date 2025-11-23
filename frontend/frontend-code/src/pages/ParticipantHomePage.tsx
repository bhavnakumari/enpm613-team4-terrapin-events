import { Link } from 'react-router-dom';
import { Calendar, Users, Search, TrendingUp, ArrowRight, Star, ChevronRight, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Input } from '../components/ui/input';
import umdArenaImage from 'figma:asset/3fc834086fb25400b52cb9a396ec6c845aa019d4.png';
import { useState, useEffect } from 'react';
import { eventsService } from '../services/events.service';
import { registrationsService } from '../services/registrations.service';

export function ParticipantHomePage() {
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([
    { name: 'Academic', count: 0, color: 'bg-blue-500', bgGradient: 'from-blue-500/10 to-blue-500/5', iconBg: 'bg-blue-500' },
    { name: 'Social', count: 0, color: 'bg-purple-500', bgGradient: 'from-purple-500/10 to-purple-500/5', iconBg: 'bg-purple-500' },
    { name: 'Sports', count: 0, color: 'bg-green-500', bgGradient: 'from-green-500/10 to-green-500/5', iconBg: 'bg-green-500' },
    { name: 'Career', count: 0, color: 'bg-orange-500', bgGradient: 'from-orange-500/10 to-orange-500/5', iconBg: 'bg-orange-500' },
    { name: 'Arts', count: 0, color: 'bg-pink-500', bgGradient: 'from-pink-500/10 to-pink-500/5', iconBg: 'bg-pink-500' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const startTime = performance.now();
      try {
        // Parallel API calls for better performance
        const [catalogEvents, regsWithEvents, categoryStats] = await Promise.all([
          eventsService.getCatalog(),
          registrationsService.getMyRegistrationsWithEvents(),
          eventsService.getCategoryStats()
        ]);

        const endTime = performance.now();
        console.log(`✅ Home data loaded in ${(endTime - startTime).toFixed(0)}ms (parallel)`);

        // Process upcoming events
        const now = new Date();
        const upcoming = catalogEvents
          .filter(e => new Date(e.start_time) > now)
          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
          .slice(0, 4)
          .map(e => ({
            id: e.event_id,
            title: e.title,
            date: new Date(e.start_time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: new Date(e.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            location: e.location,
            category: e.category?.charAt(0).toUpperCase() + e.category?.slice(1) || 'Event',
            attendees: e.attendee_count || 0,
            image: e.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          }));
        setUpcomingEvents(upcoming);

        // Process registrations
        const regEvents = regsWithEvents.slice(0, 2).map(r => ({
          id: r.event_id,
          title: r.event_details.title,
          date: new Date(r.event_details.start_time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          status: r.status === 'registered' ? 'Confirmed' : 'Waitlisted',
        }));
        setMyRegistrations(regEvents);

        // Process category stats
        const categoryCounts = categoryStats.reduce((acc: any, stat) => {
          const cat = stat.category?.charAt(0).toUpperCase() + stat.category?.slice(1);
          acc[cat] = stat.count;
          return acc;
        }, {});
        setCategories(prev => prev.map(c => ({ ...c, count: categoryCounts[c.name] || 0 })));
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <img
          src={umdArenaImage}
          alt="University of Maryland Campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl text-white">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Star className="w-3 h-3 mr-1" />
                Welcome Back!
              </Badge>
              <h1 className="mb-4 text-white">
                Discover Your Next Campus Experience
              </h1>
              <p className="text-xl text-white/90 mb-6">
                Browse events, connect with students, and make the most of your time at UMD.
              </p>
              
              {/* Search Bar */}
              <div className="flex gap-3 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for events..."
                    className="pl-10 bg-white dark:bg-gray-800 border-0"
                  />
                </div>
                <Button className="bg-[#E21833] hover:bg-[#C11528] text-white">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Registrations Section */}
      <section className="py-12 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[#E21833]">My Registrations</h2>
              <p className="text-muted-foreground">Events you're attending</p>
            </div>
            <Link to="/profile">
              <Button variant="outline">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRegistrations.map((event) => (
              <Card key={event.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <h3 className="mb-1">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </div>
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-0">
                      {event.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-[#E21833]">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link key={category.name} to={`/events?category=${category.name}`}>
                <Card className={`relative overflow-hidden p-6 text-center hover:shadow-lg transition-all cursor-pointer group border-gray-200/60 dark:border-gray-800 bg-gradient-to-br ${category.bgGradient} dark:from-gray-800 dark:to-gray-900`}>
                  {/* Decorative background circles - only visible in light mode */}
                  <div className={`absolute -top-8 -right-8 w-24 h-24 ${category.iconBg} opacity-[0.08] dark:opacity-0 rounded-full group-hover:scale-110 transition-transform`} />
                  <div className={`absolute -bottom-6 -left-6 w-20 h-20 ${category.iconBg} opacity-[0.06] dark:opacity-0 rounded-full group-hover:scale-110 transition-transform`} />
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 ${category.iconBg} rounded-full mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="mb-1 group-hover:text-[#E21833] transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{category.count} events</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="mb-2 text-[#E21833]">Upcoming Events</h2>
              <p className="text-muted-foreground">Don't miss out on these exciting campus activities</p>
            </div>
            <Link to="/events">
              <Button variant="outline">
                View All Events
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white border-0">
                      {event.category}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 group-hover:text-[#E21833] transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {event.time}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {event.attendees} going
                      </div>
                      <Button size="sm" variant="ghost" className="text-[#E21833] hover:text-[#C11528] h-auto p-0">
                        Register →
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-[#E21833] mb-2">78</div>
              <div className="text-muted-foreground">Active Events</div>
            </div>
            <div>
              <div className="text-[#E21833] mb-2">2</div>
              <div className="text-muted-foreground">My Registrations</div>
            </div>
            <div>
              <div className="text-[#E21833] mb-2">200+</div>
              <div className="text-muted-foreground">Student Organizations</div>
            </div>
            <div>
              <div className="text-[#E21833] mb-2">50,000+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}