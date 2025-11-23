import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Edit, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  Users,
  TrendingUp,
  Sparkles,
  Zap,
  Target,
  Award,
  Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { eventsService } from '../services/events.service';
import { toast } from 'sonner';
import type { Event } from '../types/event';

export function OrganiserHomePage() {
  const [activeTab, setActiveTab] = useState<'drafts' | 'published'>('drafts');
  const [draftEvents, setDraftEvents] = useState<any[]>([]);
  const [publishedEvents, setPublishedEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    drafts: 0,
    attendees: 0,
    approvalRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setIsLoading(true);
        const myEvents = await eventsService.getMyEvents();
        
        // Separate draft and published events
        const drafts = myEvents
          .filter(e => e.status === 'draft')
          .map(e => ({
            id: e.event_id,
            title: e.title,
            lastEdited: new Date(e.updated_at).toLocaleDateString(),
            completeness: e.description && e.location && e.start_time ? 100 : 50,
            category: (e.category ? e.category.charAt(0).toUpperCase() + e.category.slice(1) : 'Event'),
            description: e.description || 'No description',
            estimatedAttendees: e.capacity,
          }));
        
        const published = myEvents
          .filter(e => e.status !== 'draft')
          .map(e => ({
            id: e.event_id,
            title: e.title,
            submittedDate: new Date(e.created_at).toLocaleDateString(),
            status: e.status,
            attendees: 0, // Will be populated from registrations
            category: (e.category ? e.category.charAt(0).toUpperCase() + e.category.slice(1) : 'Event'),
            views: 0,
            rejectionReason: e.status === 'rejected' ? 'See event details' : undefined
          }));
        
        setDraftEvents(drafts);
        setPublishedEvents(published);
        
        // Calculate stats
        const approved = myEvents.filter(e => e.status === 'approved').length;
        const total = myEvents.filter(e => e.status !== 'draft').length;
        setStats({
          total: myEvents.length,
          drafts: drafts.length,
          attendees: 0, // Will be calculated from registrations
          approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0
        });
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  const handlePublishDraft = async (eventId: string) => {
    try {
      // Update event status from draft to pending_approval
      await eventsService.updateEvent(eventId, { status: 'pending_approval' });
      
      toast.success('Event published and submitted for approval!', {
        description: 'You will be notified once an admin reviews your event.',
      });
      
      // Refresh events list
      const myEvents = await eventsService.getMyEvents();
      const drafts = myEvents.filter(e => e.status === 'draft').map(e => ({
        id: e.event_id,
        title: e.title,
        lastEdited: new Date(e.updated_at).toLocaleDateString(),
        completeness: e.description && e.location && e.start_time ? 100 : 50,
        category: (e.category ? e.category.charAt(0).toUpperCase() + e.category.slice(1) : 'Event'),
        description: e.description || 'No description',
        estimatedAttendees: e.capacity,
      }));
      const published = myEvents.filter(e => e.status !== 'draft').map(e => ({
        id: e.event_id,
        title: e.title,
        submittedDate: new Date(e.created_at).toLocaleDateString(),
        status: e.status,
        attendees: 0,
        category: (e.category ? e.category.charAt(0).toUpperCase() + e.category.slice(1) : 'Event'),
        views: 0,
        rejectionReason: e.status === 'rejected' ? 'See event details' : undefined
      }));
      setDraftEvents(drafts);
      setPublishedEvents(published);
    } catch (error) {
      console.error('Failed to publish draft:', error);
      toast.error('Failed to publish event');
    }
  };

  const statsDisplay = [
    {
      title: 'Total Events',
      value: stats.total.toString(),
      change: `${stats.drafts} drafts`,
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Draft Events',
      value: stats.drafts.toString(),
      change: 'In progress',
      icon: FileText,
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Total Attendees',
      value: stats.attendees.toString(),
      change: 'Across all events',
      icon: Users,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Success Rate',
      value: `${stats.approvalRate}%`,
      change: 'Event approval',
      icon: Award,
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'waiting':
        return (
          <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-0">
            <Clock className="w-3 h-3 mr-1" />
            Waiting for Approval
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-0">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Image */}
      <section className="relative bg-gray-900 text-white py-16 overflow-hidden">
        {/* Background Image - Full Section */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1603857365671-93cd96dc1df8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYWVyaWFsfGVufDF8fHx8MTc2MzA4MTQ0Mnww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="UMD Campus Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#E21833]/90 via-[#C11528]/80 to-[#8B0F1C]/70" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Organizer Dashboard</span>
              </div>
              
              <h1 className="mb-4 text-white">
                Bring Your Events to Life
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Create memorable experiences, connect with your audience, and track your success all in one place.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/create-event">
                  <Button size="lg" className="bg-white text-[#E21833] hover:bg-gray-100 hover:scale-105 active:scale-95 transition-transform">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Event
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-transform">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHN8ZW58MXx8fHwxNzYzMDgxNDQyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="UMD Students Collaborating"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-12 bg-background -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsDisplay.map((stat, index) => (
              <div key={stat.title}>
                <Card className="p-6 hover:shadow-lg transition-shadow border-2">
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-muted-foreground mb-1 text-sm">{stat.title}</div>
                  <div className="mb-1 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions with Images */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-[#E21833] mb-2">Quick Actions</h2>
            <p className="text-muted-foreground">Everything you need to manage your events</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create Event Card */}
            <div className="hover:-translate-y-2 transition-transform">
              <Link to="/create-event">
                <Card className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all">
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1760022638435-aad7c1e684b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMHBsYW5uaW5nJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MzcwMTc0OHww&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Create Event"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 flex items-center justify-between">
                      Create New Event
                      <ArrowRight className="w-5 h-5 text-[#E21833] group-hover:translate-x-1 transition-transform" />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Start planning your next amazing event with our easy-to-use wizard
                    </p>
                  </div>
                </Card>
              </Link>
            </div>

            {/* Analytics Card */}
            <div className="hover:-translate-y-2 transition-transform">
              <Link to="/analytics">
                <Card className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all">
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1759752394755-1241472b589d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjBkYXNoYm9hcmQlMjBzY3JlZW58ZW58MXx8fHwxNzYzNzA2MzI2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Analytics"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 flex items-center justify-between">
                      View Analytics
                      <ArrowRight className="w-5 h-5 text-[#E21833] group-hover:translate-x-1 transition-transform" />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Track performance metrics and gain insights into your events
                    </p>
                  </div>
                </Card>
              </Link>
            </div>

            {/* Drafts Card */}
            <div className="hover:-translate-y-2 transition-transform">
              <div onClick={() => setActiveTab('drafts')} className="cursor-pointer">
                <Card className="overflow-hidden group hover:shadow-xl transition-all">
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1761300725208-e8f92da35f5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZWxlYnJhdGlvbiUyMGV2ZW50JTIwcGFydHl8ZW58MXx8fHwxNzYzNzU4ODE3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Draft Events"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-orange-500">
                        {draftEvents.length} Drafts
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 flex items-center justify-between">
                      Continue Editing
                      <ArrowRight className="w-5 h-5 text-[#E21833] group-hover:translate-x-1 transition-transform" />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Pick up where you left off with your saved drafts
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Management with Tabs */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Custom Tab Navigation */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-8 py-3 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                activeTab === 'drafts'
                  ? 'bg-[#E21833] text-white shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>Draft Events ({draftEvents.length})</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('published')}
              className={`px-8 py-3 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                activeTab === 'published'
                  ? 'bg-[#E21833] text-white shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Your Events ({publishedEvents.length})</span>
              </div>
            </button>
          </div>

          {/* Draft Events */}
          {activeTab === 'drafts' && (
            <div>
              <Card className="p-8">
                <div className="mb-8">
                  <h2 className="text-[#E21833] mb-2">Draft Events</h2>
                  <p className="text-muted-foreground">
                    Continue editing your saved events and publish when ready
                  </p>
                </div>

                {draftEvents.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <div>
                      <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2">No Draft Events</h3>
                    <p className="text-muted-foreground mb-6">
                      Start creating your first event
                    </p>
                    <Link to="/create-event">
                      <Button size="lg" className="bg-[#E21833] hover:bg-[#C11528]">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Event
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {draftEvents.map((event, index) => (
                      <div
                        key={event.id}
                        className="p-6 border-2 rounded-xl hover:border-[#E21833]/30 hover:shadow-lg hover:scale-[1.01] transition-all bg-gradient-to-r from-background to-muted/20"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3>{event.title}</h3>
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0">
                                {event.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {event.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {event.lastEdited}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Est. {event.estimatedAttendees} attendees
                              </span>
                              <span>•</span>
                              <span className={`flex items-center gap-1 ${
                                event.completeness >= 80 ? 'text-green-600 dark:text-green-400' :
                                event.completeness >= 50 ? 'text-orange-600 dark:text-orange-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                <Target className="w-4 h-4" />
                                {event.completeness}% complete
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Link to={`/create-event?draft=${event.id}`}>
                              <Button size="sm" variant="outline" className="hover:scale-105 active:scale-95 transition-transform">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              className="bg-[#E21833] hover:bg-[#C11528] hover:scale-105 active:scale-95 transition-transform"
                              onClick={() => handlePublishDraft(event.id)}
                            >
                              <Zap className="w-4 h-4 mr-1" />
                              Publish
                            </Button>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#E21833] to-[#C11528] h-2.5 rounded-full transition-all duration-1000"
                              style={{ width: `${event.completeness}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Published Events */}
          {activeTab === 'published' && (
            <div>
              <Card className="p-8">
                <div className="mb-8">
                  <h2 className="text-[#E21833] mb-2">Your Events</h2>
                  <p className="text-muted-foreground">
                    Track the status and performance of your published events
                  </p>
                </div>

                {publishedEvents.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <div>
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2">No Published Events</h3>
                    <p className="text-muted-foreground mb-6">
                      Publish your draft events to see them here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {publishedEvents.map((event, index) => (
                      <div
                        key={event.id}
                        className="p-6 border-2 rounded-xl hover:border-[#E21833]/30 hover:shadow-lg hover:scale-[1.01] transition-all bg-gradient-to-r from-background to-muted/20"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3>{event.title}</h3>
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-0">
                                {event.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span>Submitted {event.submittedDate}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {event.views} views
                              </span>
                              {event.status === 'approved' && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {event.attendees} registered
                                  </span>
                                </>
                              )}
                            </div>
                            <div>{getStatusBadge(event.status)}</div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {event.status === 'approved' && (
                              <>
                                <Link to={`/analytics?event=${event.id}`}>
                                  <Button size="sm" variant="outline" className="hover:scale-105 active:scale-95 transition-transform">
                                    <BarChart3 className="w-4 h-4 mr-1" />
                                    Analytics
                                  </Button>
                                </Link>
                                <Link to={`/create-event?edit=${event.id}`}>
                                  <Button size="sm" variant="outline" className="hover:scale-105 active:scale-95 transition-transform">
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>
                                </Link>
                              </>
                            )}
                            {event.status === 'rejected' && (
                              <Link to={`/create-event?resubmit=${event.id}`}>
                                <Button size="sm" className="bg-[#E21833] hover:bg-[#C11528] hover:scale-105 active:scale-95 transition-transform">
                                  <Zap className="w-4 h-4 mr-1" />
                                  Resubmit
                                </Button>
                              </Link>
                            )}
                            {event.status === 'waiting' && (
                              <Button size="sm" variant="outline" disabled>
                                <Clock className="w-4 h-4 mr-1" />
                                Pending Review
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Rejection Reason */}
                        {event.status === 'rejected' && event.rejectionReason && (
                          <div className="mt-4 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm text-red-600 dark:text-red-400 mb-1">
                                Rejection Reason:
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {event.rejectionReason}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
