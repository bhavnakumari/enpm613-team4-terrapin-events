import { Link } from 'react-router-dom';
import { useState } from 'react';
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
import umdStudentsImage from 'figma:asset/4cff8f2c455ab3900a0a28dbc0b394a77b5bf782.png';
import umdCampusImage from 'figma:asset/c695a233bd22a3d4efe3c894adc54335f92cd587.png';

export function OrganiserHomePage() {
  const [activeTab, setActiveTab] = useState<'drafts' | 'published'>('drafts');

  const stats = [
    {
      title: 'Total Events',
      value: '12',
      change: '+3 this month',
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Draft Events',
      value: '10',
      change: 'In progress',
      icon: FileText,
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Total Attendees',
      value: '847',
      change: '+128 this week',
      icon: Users,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Success Rate',
      value: '94%',
      change: 'Event approval',
      icon: Award,
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  const draftEvents = [
    {
      id: '1',
      title: 'AI & Machine Learning Workshop',
      lastEdited: '2 hours ago',
      completeness: 85,
      category: 'Academic',
      description: 'Hands-on workshop exploring the latest in AI technology',
      estimatedAttendees: 150,
    },
    {
      id: '2',
      title: 'Spring Festival 2026',
      lastEdited: '1 day ago',
      completeness: 60,
      category: 'Social',
      description: 'Annual spring celebration with food, music, and activities',
      estimatedAttendees: 500,
    },
    {
      id: '3',
      title: 'Entrepreneurship Bootcamp',
      lastEdited: '3 days ago',
      completeness: 45,
      category: 'Career',
      description: 'Intensive program for aspiring entrepreneurs',
      estimatedAttendees: 80,
    },
    {
      id: '4',
      title: 'Photography Exhibition',
      lastEdited: '5 days ago',
      completeness: 30,
      category: 'Arts',
      description: 'Showcasing student photography from around campus',
      estimatedAttendees: 200,
    },
    {
      id: '5',
      title: 'Cybersecurity Awareness Week',
      lastEdited: '1 week ago',
      completeness: 75,
      category: 'Academic',
      description: 'Week-long series of workshops and talks on digital security',
      estimatedAttendees: 300,
    },
    {
      id: '6',
      title: 'Terps Basketball Watch Party',
      lastEdited: '1 week ago',
      completeness: 90,
      category: 'Sports',
      description: 'Live viewing of the championship game with snacks and prizes',
      estimatedAttendees: 250,
    },
    {
      id: '7',
      title: 'Cultural Food Festival',
      lastEdited: '2 weeks ago',
      completeness: 55,
      category: 'Social',
      description: 'Celebrate diversity with international cuisine from student organizations',
      estimatedAttendees: 600,
    },
    {
      id: '8',
      title: 'Hackathon 2026',
      lastEdited: '2 weeks ago',
      completeness: 40,
      category: 'Academic',
      description: '24-hour coding marathon with industry sponsors and prizes',
      estimatedAttendees: 120,
    },
    {
      id: '9',
      title: 'Resume Writing Workshop',
      lastEdited: '3 weeks ago',
      completeness: 70,
      category: 'Career',
      description: 'Learn how to craft a compelling resume with career experts',
      estimatedAttendees: 100,
    },
    {
      id: '10',
      title: 'Open Mic Night',
      lastEdited: '3 weeks ago',
      completeness: 25,
      category: 'Arts',
      description: 'Showcase your talents: music, poetry, comedy, and more',
      estimatedAttendees: 150,
    },
  ];

  const publishedEvents = [
    {
      id: '1',
      title: 'Annual Tech Symposium 2025',
      submittedDate: 'Nov 10, 2025',
      status: 'approved',
      attendees: 145,
      category: 'Academic',
      views: 1250,
    },
    {
      id: '2',
      title: 'Campus Charity Run',
      submittedDate: 'Nov 15, 2025',
      status: 'waiting',
      attendees: 0,
      category: 'Sports',
      views: 432,
    },
    {
      id: '3',
      title: 'Late Night Concert Series',
      submittedDate: 'Nov 12, 2025',
      status: 'rejected',
      attendees: 0,
      category: 'Social',
      rejectionReason: 'Incomplete venue safety documentation',
      views: 89,
    },
    {
      id: '4',
      title: 'Career Fair 2025',
      submittedDate: 'Oct 28, 2025',
      status: 'approved',
      attendees: 234,
      category: 'Career',
      views: 2180,
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
            src={umdCampusImage}
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
                  <Button size="lg" className="bg-white text-[#E21833] hover:bg-gray-100">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Event
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
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
                  src={umdStudentsImage}
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
            {stats.map((stat) => (
              <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow border-2">
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

            {/* Analytics Card */}
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

            {/* Drafts Card */}
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
      </section>

      {/* Events Management with Tabs */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Custom Tab Navigation */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-8 py-3 rounded-lg transition-all ${
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
              className={`px-8 py-3 rounded-lg transition-all ${
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
            <Card className="p-8">
              <div className="mb-8">
                <h2 className="text-[#E21833] mb-2">Draft Events</h2>
                <p className="text-muted-foreground">
                  Continue editing your saved events and publish when ready
                </p>
              </div>

              {draftEvents.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
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
                  {draftEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-6 border-2 rounded-xl hover:border-[#E21833]/30 hover:shadow-lg transition-all bg-gradient-to-r from-background to-muted/20"
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
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button size="sm" className="bg-[#E21833] hover:bg-[#C11528]">
                            <Zap className="w-4 h-4 mr-1" />
                            Publish
                          </Button>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#E21833] to-[#C11528] h-2.5 rounded-full"
                            style={{ width: `${event.completeness}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Published Events */}
          {activeTab === 'published' && (
            <Card className="p-8">
              <div className="mb-8">
                <h2 className="text-[#E21833] mb-2">Your Events</h2>
                <p className="text-muted-foreground">
                  Track the status and performance of your published events
                </p>
              </div>

              {publishedEvents.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="mb-2">No Published Events</h3>
                  <p className="text-muted-foreground mb-6">
                    Publish your draft events to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {publishedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-6 border-2 rounded-xl hover:border-[#E21833]/30 hover:shadow-lg transition-all bg-gradient-to-r from-background to-muted/20"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3>{event.title}</h3>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0">
                              {event.category}
                            </Badge>
                            {getStatusBadge(event.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Submitted {event.submittedDate}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.attendees} registered
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {event.views} views
                            </span>
                          </div>
                          {event.status === 'rejected' && event.rejectionReason && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                              <div className="text-sm text-red-700 dark:text-red-300">
                                <strong>Rejection Reason:</strong> {event.rejectionReason}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link to={`/events/${event.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          {event.status === 'approved' && (
                            <Link to="/analytics">
                              <Button size="sm" className="bg-[#E21833] hover:bg-[#C11528]">
                                <BarChart3 className="w-4 h-4 mr-1" />
                                Analytics
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
