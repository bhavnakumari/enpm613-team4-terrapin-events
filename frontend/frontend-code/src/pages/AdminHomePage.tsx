import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

export function AdminHomePage() {
  const stats = [
    {
      title: 'Total Events',
      value: '156',
      change: '+12%',
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Pending Approval',
      value: '8',
      change: '+3',
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Total Registrations',
      value: '2,847',
      change: '+18%',
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+8%',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const pendingEvents = [
    {
      id: '1',
      title: 'AI & Machine Learning Workshop',
      organizer: 'Computer Science Club',
      submittedDate: 'Nov 18, 2025',
      category: 'Academic',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Spring Festival 2026 Planning',
      organizer: 'Student Activities Office',
      submittedDate: 'Nov 17, 2025',
      category: 'Social',
      status: 'pending',
    },
    {
      id: '3',
      title: 'Entrepreneurship Pitch Competition',
      organizer: 'Business School',
      submittedDate: 'Nov 16, 2025',
      category: 'Career',
      status: 'pending',
    },
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'Approved',
      event: 'Annual Tech Symposium 2025',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      id: '2',
      action: 'Rejected',
      event: 'Unauthorized Campus Rally',
      time: '4 hours ago',
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
    },
    {
      id: '3',
      action: 'Approved',
      event: 'Basketball Tournament Finals',
      time: '5 hours ago',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      id: '4',
      action: 'Flagged',
      event: 'Late Night Study Session',
      time: '1 day ago',
      icon: AlertCircle,
      color: 'text-yellow-600 dark:text-yellow-400',
    },
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Annual Tech Symposium 2025',
      date: 'Dec 15, 2025',
      registrations: 145,
      capacity: 200,
      status: 'On Track',
    },
    {
      id: '2',
      title: 'Career Fair 2025',
      date: 'Dec 1, 2025',
      registrations: 234,
      capacity: 300,
      status: 'High Demand',
    },
    {
      id: '3',
      title: 'Basketball Tournament',
      date: 'Nov 25, 2025',
      registrations: 96,
      capacity: 150,
      status: 'On Track',
    },
  ];

  const quickActions = [
    {
      title: 'Review Pending Events',
      description: '8 events awaiting approval',
      icon: Shield,
      link: '/admin',
      color: 'bg-orange-500',
    },
    {
      title: 'View Analytics',
      description: 'Check event performance',
      icon: BarChart3,
      link: '/analytics',
      color: 'bg-blue-500',
    },
    {
      title: 'Create Event',
      description: 'Add a new campus event',
      icon: Calendar,
      link: '/create-event',
      color: 'bg-green-500',
    },
    {
      title: 'Manage Settings',
      description: 'System configuration',
      icon: Settings,
      link: '/admin',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-[#E21833] to-[#C11528] dark:from-[#C11528] dark:to-[#A01020] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-white">Admin Dashboard</h1>
              <p className="text-xl text-white/90">
                Welcome back, Admin! Here's your event management overview.
              </p>
            </div>
            <div className="hidden md:flex gap-3">
              <Link to="/create-event">
                <Button size="lg" className="bg-white text-[#E21833] hover:bg-gray-100">
                  Create Event
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-600/30">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-muted-foreground mb-1">{stat.title}</div>
                <div className={stat.color}>{stat.value}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="pb-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Pending Events */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pending Events */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-[#E21833]">Pending Approvals</h2>
                    <p className="text-muted-foreground">Events requiring your review</p>
                  </div>
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {pendingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="mb-1">{event.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>By {event.organizer}</span>
                            <span>•</span>
                            <span>{event.submittedDate}</span>
                            <Badge variant="outline" className="ml-2">
                              {event.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Upcoming Events */}
              <Card className="p-6">
                <h2 className="mb-4 text-[#E21833]">Upcoming Events Status</h2>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="mb-1">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.date}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            event.status === 'High Demand'
                              ? 'text-orange-600 border-orange-600/30'
                              : 'text-green-600 border-green-600/30'
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Registration Progress</span>
                          <span>
                            {event.registrations} / {event.capacity}
                          </span>
                        </div>
                        <Progress
                          value={(event.registrations / event.capacity) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Quick Actions & Activity */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="mb-4 text-[#E21833]">Quick Actions</h2>
                <div className="space-y-3">
                  {quickActions.map((action) => (
                    <Link key={action.title} to={action.link}>
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                          >
                            <action.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-1 group-hover:text-[#E21833] transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {action.description}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[#E21833] transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h2 className="mb-4 text-[#E21833]">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`mt-1 ${activity.color}`}>
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="mb-1">
                              <span className={activity.color}>{activity.action}</span> {activity.event}
                            </p>
                            <p className="text-sm text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
