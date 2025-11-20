import { useState } from 'react';
import { Check, X, Clock, Eye, AlertTriangle, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface PendingEvent {
  id: string;
  title: string;
  organizer: string;
  category: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  maxAttendees: number;
  price?: number;
}

const mockEvents: PendingEvent[] = [
  {
    id: '1',
    title: 'AI & Machine Learning Workshop',
    organizer: 'Computer Science Club',
    category: 'Workshop',
    date: 'December 20, 2025',
    time: '2:00 PM - 5:00 PM',
    location: 'Computer Lab 301',
    description: 'Hands-on workshop covering the fundamentals of AI and machine learning with practical exercises.',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    submittedAt: '2 hours ago',
    status: 'pending',
    maxAttendees: 30,
  },
  {
    id: '2',
    title: 'Spring Festival 2026',
    organizer: 'Student Council',
    category: 'Social',
    date: 'March 15, 2026',
    time: '6:00 PM - 10:00 PM',
    location: 'Grand Plaza',
    description: 'Annual spring festival featuring food vendors, live music, and carnival games.',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
    submittedAt: '5 hours ago',
    status: 'pending',
    maxAttendees: 500,
    price: 5,
  },
  {
    id: '3',
    title: 'Career Fair: Tech Companies',
    organizer: 'Career Services',
    category: 'Career',
    date: 'January 10, 2026',
    time: '10:00 AM - 4:00 PM',
    location: 'Exhibition Center',
    description: 'Meet recruiters from top tech companies. Bring your resume and dress professionally.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
    submittedAt: '1 day ago',
    status: 'pending',
    maxAttendees: 300,
  },
];

export function AdminApprovalPage() {
  const [events, setEvents] = useState<PendingEvent[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  const handleReview = (event: PendingEvent, action: 'approve' | 'reject') => {
    setSelectedEvent(event);
    setReviewAction(action);
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedEvent) return;

    setEvents(events.map(event => 
      event.id === selectedEvent.id
        ? { ...event, status: reviewAction === 'approve' ? 'approved' : 'rejected' }
        : event
    ));

    setIsReviewDialogOpen(false);
    setReviewNotes('');
    setSelectedEvent(null);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: events.filter(e => e.status === 'pending').length,
    approved: events.filter(e => e.status === 'approved').length,
    rejected: events.filter(e => e.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-[#E21833]">Event Approval Dashboard</h1>
          <p className="text-muted-foreground">Review and approve events submitted by organizers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
                <p className="text-foreground">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Approved</p>
                <p className="text-foreground">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rejected</p>
                <p className="text-foreground">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search events or organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              Pending ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({stats.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({stats.rejected})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="space-y-4">
            {filteredEvents.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms' : 'No events in this category'}
                </p>
              </Card>
            ) : (
              filteredEvents.map((event) => (
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
                            <Badge
                              variant={
                                event.status === 'approved'
                                  ? 'default'
                                  : event.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {event.organizer} • {event.submittedAt}
                          </p>
                        </div>
                      </div>

                      <p className="text-muted-foreground line-clamp-2">{event.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Category</p>
                          <p>{event.category}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p>{event.date}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Capacity</p>
                          <p>{event.maxAttendees} attendees</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p>{event.price ? `$${event.price}` : 'Free'}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {event.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleReview(event, 'approve')}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleReview(event, 'reject')}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approve' ? 'Approve Event' : 'Reject Event'}
              </DialogTitle>
              <DialogDescription>
                {reviewAction === 'approve'
                  ? 'This event will be published and visible to all students.'
                  : 'Please provide a reason for rejecting this event.'}
              </DialogDescription>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="mb-1">{selectedEvent.title}</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.organizer}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">
                    {reviewAction === 'approve' ? 'Additional Notes (Optional)' : 'Rejection Reason *'}
                  </Label>
                  <Textarea
                    id="notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder={
                      reviewAction === 'approve'
                        ? 'Add any notes for the organizer...'
                        : 'Explain why this event is being rejected...'
                    }
                    rows={4}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                className={reviewAction === 'approve' ? 'bg-[#E21833] hover:bg-[#C11528]' : ''}
                variant={reviewAction === 'reject' ? 'destructive' : 'default'}
              >
                {reviewAction === 'approve' ? 'Approve Event' : 'Reject Event'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
