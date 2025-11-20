import { TrendingUp, Users, Calendar, DollarSign, Eye, MapPin, Share2, Download } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const registrationData = [
  { date: 'Nov 1', registrations: 12 },
  { date: 'Nov 3', registrations: 19 },
  { date: 'Nov 5', registrations: 25 },
  { date: 'Nov 7', registrations: 32 },
  { date: 'Nov 9', registrations: 45 },
  { date: 'Nov 11', registrations: 68 },
  { date: 'Nov 13', registrations: 89 },
  { date: 'Nov 15', registrations: 145 },
];

const categoryData = [
  { name: 'Academic', value: 35, color: '#3B82F6' },
  { name: 'Social', value: 25, color: '#8B5CF6' },
  { name: 'Sports', value: 15, color: '#10B981' },
  { name: 'Workshop', value: 15, color: '#F59E0B' },
  { name: 'Cultural', value: 10, color: '#EC4899' },
];

const eventPerformance = [
  { name: 'Tech Symposium', views: 450, registrations: 145, revenue: 3625 },
  { name: 'Social Mixer', views: 320, registrations: 87, revenue: 0 },
  { name: 'Basketball', views: 280, registrations: 96, revenue: 960 },
  { name: 'Workshop', views: 180, registrations: 28, revenue: 560 },
  { name: 'Cultural Night', views: 520, registrations: 234, revenue: 2340 },
];

export function AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2 text-[#E21833]">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your event performance and engagement</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Time Period Tabs */}
        <Tabs defaultValue="month" className="mb-8">
          <TabsList>
            <TabsTrigger value="week">Last 7 Days</TabsTrigger>
            <TabsTrigger value="month">Last 30 Days</TabsTrigger>
            <TabsTrigger value="year">This Year</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value="month" className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <div className="w-10 h-10 bg-[#E21833]/10 dark:bg-[#C11528]/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#E21833]" />
                  </div>
                </div>
                <p className="mb-1">24</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% from last month
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Total Registrations</p>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                  </div>
                </div>
                <p className="mb-1">1,247</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +23% from last month
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-500" />
                  </div>
                </div>
                <p className="mb-1">$8,485</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +18% from last month
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Page Views</p>
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                  </div>
                </div>
                <p className="mb-1">12,450</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8% from last month
                </div>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Trend */}
              <Card className="p-6">
                <h3 className="mb-6">Registration Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={registrationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="#E21833"
                      strokeWidth={2}
                      dot={{ fill: '#E21833' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Event Categories */}
              <Card className="p-6">
                <h3 className="mb-6">Events by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Event Performance Table */}
            <Card className="p-6">
              <h3 className="mb-6">Top Performing Events</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#8B5CF6" name="Views" />
                  <Bar dataKey="registrations" fill="#E21833" name="Registrations" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="mb-6">Conversion Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>View to Registration Rate</span>
                      <span>12.5%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-[#E21833] h-2 rounded-full" style={{ width: '12.5%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Registration Completion Rate</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Ticket Price</span>
                      <span>$15.50</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Repeat Attendee Rate</span>
                      <span>42%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-6">Popular Venues</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Main Auditorium', events: 8, attendees: 1420 },
                    { name: 'Student Center', events: 6, attendees: 980 },
                    { name: 'Recreation Center', events: 4, attendees: 650 },
                    { name: 'Computer Labs', events: 3, attendees: 180 },
                    { name: 'Grand Hall', events: 3, attendees: 1200 },
                  ].map((venue, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{venue.name}</span>
                          <span className="text-sm text-muted-foreground">{venue.events} events</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{venue.attendees} total attendees</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
