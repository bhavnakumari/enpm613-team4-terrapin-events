import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  Settings,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { eventsService } from '../services/events.service';
import { toast } from 'sonner';

interface PendingEvent {
  event_id: string;
  title: string;
  description?: string;
  category?: string;
  location: string;
  start_time: string;
  capacity: number;
  organizer_id: string;
  organizer_email: string;
  organizer_name?: string;
  organizer_department?: string;
  created_at: string;
  status: string;
}

interface AdminStats {
  total_events: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  draft: number;
  total_registrations: number;
  active_users: number;
  recent_activity: Array<{
    event_id: string;
    title: string;
    status: string;
    updated_at: string;
  }>;
  upcoming_events: Array<{
    event_id: string;
    title: string;
    start_time: string;
    capacity: number;
    registrations_count: number;
  }>;
}

export function AdminHomePage() {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [approvingEventId, setApprovingEventId] = useState<string | null>(null);
  const [rejectingEventId, setRejectingEventId] = useState<string | null>(null);
  
  // Load pending events and stats on mount
  useEffect(() => {
    loadPendingEvents();
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      setIsLoadingStats(true);
      const stats = await eventsService.getAdminStats();
      setAdminStats(stats);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadPendingEvents = async () => {
    try {
      setIsLoadingPending(true);
      const events = await eventsService.getPendingEvents();
      setPendingEvents(events);
    } catch (error) {
      console.error('Failed to load pending events:', error);
      toast.error('Failed to load pending events');
    } finally {
      setIsLoadingPending(false);
    }
  };

  const handleApprove = async (eventId: string) => {
    try {
      setApprovingEventId(eventId);
      await eventsService.updateEvent(eventId, { status: 'approved' });
      toast.success('Event approved successfully');
      // Remove from pending list and reload stats
      setPendingEvents(prev => prev.filter(e => e.event_id !== eventId));
      loadAdminStats();
    } catch (error) {
      console.error('Failed to approve event:', error);
      toast.error('Failed to approve event');
    } finally {
      setApprovingEventId(null);
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      setRejectingEventId(eventId);
      await eventsService.updateEvent(eventId, { status: 'rejected' });
      toast.success('Event rejected');
      // Remove from pending list and reload stats
      setPendingEvents(prev => prev.filter(e => e.event_id !== eventId));
      loadAdminStats();
    } catch (error) {
      console.error('Failed to reject event:', error);
      toast.error('Failed to reject event');
    } finally {
      setRejectingEventId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  const stats = [
    {
      title: 'Total Events',
      value: isLoadingStats ? '...' : (adminStats?.total_events || 0).toString(),
      change: '+12%',
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Pending Approval',
      value: isLoadingStats ? '...' : (adminStats?.pending_approval || 0).toString(),
      change: `${adminStats?.pending_approval || 0} new`,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Total Registrations',
      value: isLoadingStats ? '...' : (adminStats?.total_registrations || 0).toString(),
      change: '+18%',
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Active Users',
      value: isLoadingStats ? '...' : (adminStats?.active_users || 0).toString(),
      change: '+8%',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const recentActivity = (adminStats?.recent_activity || []).map(activity => ({
    id: activity.event_id,
    action: activity.status === 'approved' ? 'Approved' : 'Rejected',
    event: activity.title,
    time: formatTimeAgo(activity.updated_at),
    icon: activity.status === 'approved' ? CheckCircle : XCircle,
    color: activity.status === 'approved' 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400',
  }));

  const upcomingEvents = (adminStats?.upcoming_events || []).slice(0, 3).map(event => {
    const registrationPercentage = (event.registrations_count / event.capacity) * 100;
    return {
      id: event.event_id,
      title: event.title,
      date: formatDate(event.start_time),
      registrations: event.registrations_count,
      capacity: event.capacity,
      status: registrationPercentage >= 75 ? 'High Demand' : 'On Track',
    };
  });

  const quickActions = [
    {
      title: 'Review Pending Events',
      description: `${adminStats?.pending_approval || 0} events awaiting approval`,
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
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[#E21833] to-[#C11528] dark:from-[#C11528] dark:to-[#A01020] text-white py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-white">Admin Dashboard</h1>
              <p className="text-xl text-white/90">
                Welcome back, Admin! Here's your event management overview.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
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
              </motion.div>
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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
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

                {isLoadingPending ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pendingEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No pending events to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.event_id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="mb-1">{event.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>By {event.organizer_name || event.organizer_email}</span>
                              <span>•</span>
                              <span>{formatDate(event.created_at)}</span>
                              {event.category && (
                                <Badge variant="outline" className="ml-2">
                                  {event.category}
                                </Badge>
                              )}
                            </div>
                            {event.organizer_department && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Department: {event.organizer_department}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApprove(event.event_id)}
                            disabled={approvingEventId === event.event_id || rejectingEventId === event.event_id}
                          >
                            {approvingEventId === event.event_id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleReject(event.event_id)}
                            disabled={approvingEventId === event.event_id || rejectingEventId === event.event_id}
                          >
                            {rejectingEventId === event.event_id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-1" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

              {/* Upcoming Events */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="p-6">
                  <h2 className="mb-4 text-[#E21833]">Upcoming Events Status</h2>
                  {isLoadingStats ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : upcomingEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No upcoming events</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
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
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Quick Actions & Activity */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="p-6">
                  <h2 className="mb-4 text-[#E21833]">Quick Actions</h2>
                  <div className="space-y-3">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link to={action.link}>
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
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="p-6">
                  <h2 className="mb-4 text-[#E21833]">Recent Activity</h2>
                  {isLoadingStats ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                          className="flex items-start gap-3"
                        >
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
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}