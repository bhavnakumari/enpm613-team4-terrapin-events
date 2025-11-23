import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Mail,
  Tag,
  DollarSign,
  CheckCircle,
  CreditCard,
  Building2,
  Shield,
  Info,
  User,
  Phone,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { eventsService } from '../services/events.service';
import { registrationsService } from '../services/registrations.service';
import { toast } from 'sonner';
import type { Event } from '../types/event';

// Mock event data - in a real app, this would come from an API


const categoryColors = {
  Academic: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
  Social: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
  Sports: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300',
  Workshop: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300',
  Cultural: 'bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-950 dark:text-pink-300',
  Career: 'bg-red-50 text-[#E21833] border-red-200 dark:bg-red-950 dark:text-red-300',
  academic: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
  social: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
  sports: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300',
  workshop: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300',
  cultural: 'bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-950 dark:text-pink-300',
  career: 'bg-red-50 text-[#E21833] border-red-200 dark:bg-red-950 dark:text-red-300',
};

// Helper to format event data for display
const formatEventForDisplay = (event: any) => {
  const eventStartDate = new Date(event.start_time);
  const eventEndDate = event.end_time ? new Date(event.end_time) : null;
  
  return {
    ...event,
    event_id: event.event_id, // Ensure event_id is explicitly included for PaymentPage
    formattedDate: eventStartDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    formattedTime: eventEndDate 
      ? `${eventStartDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${eventEndDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
      : eventStartDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    displayImage: event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    displayCategory: event.category ? (event.category.charAt(0).toUpperCase() + event.category.slice(1)) : 'Academic',
    attendeeCount: event.attendee_count || 0,
    title: event.title,
    location: event.location,
    price: event.price,
    capacity: event.capacity,
  };
};

export function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'registered' | 'waitlisted' | null>(null);

  // Load event data from API
  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // Use catalog endpoint which includes attendee_count
        const catalogEvents = await eventsService.getCatalog();
        const eventData = catalogEvents.find((e: any) => e.event_id === id);
        
        if (!eventData) {
          throw new Error('Event not found');
        }
        
        setEvent(eventData);
        
        // Check if user is already registered from catalog data
        if (eventData.is_user_registered) {
          setIsRegistered(true);
          setRegistrationStatus(eventData.user_registration_status || 'registered');
        }
      } catch (error) {
        console.error('Failed to load event:', error);
        toast.error('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E21833]" />
      </div>
    );
  }

  // Find the event
  // const event = mockEvents.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="mb-4">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
          <Link to="/events">
            <Button className="bg-[#E21833] hover:bg-[#C11528]">
              Back to Events
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const displayEvent = formatEventForDisplay(event);
  const spotsLeft = event.capacity - displayEvent.attendeeCount;
  const isAlmostFull = spotsLeft <= 10 && spotsLeft > 0;
  const isFull = spotsLeft <= 0;
  const isFree = !event.is_paid || event.price === 0;

  const handleRegister = async () => {
    if (!event) return;

    // Check if event is full - block both free and paid events
    if (isFull) {
      toast.error('Event is Full', {
        description: 'This event has reached maximum capacity.',
      });
      return;
    }

    // For paid events, navigate to payment page
    if (!isFree) {
      navigate('/payment', { state: { event: displayEvent } });
      return;
    }

    // For free events, register directly
    try {
      setIsRegistering(true);
      const response = await registrationsService.registerForEvent(event.event_id);
      
      const wasWaitlisted = response.status === 'waitlisted';
      setIsRegistered(true);
      setRegistrationStatus(wasWaitlisted ? 'waitlisted' : 'registered');

      if (wasWaitlisted) {
        toast.info('Added to Waitlist', {
          description: `You've been added to the waitlist for "${event.title}". We'll notify you if a spot opens up!`,
        });
      } else {
        toast.success('Registration Confirmed!', {
          description: `You're all set for "${event.title}". Check your email for confirmation details.`,
        });
      }
      
      // Refresh event data to get updated attendee count
      const catalogEvents = await eventsService.getCatalog();
      const updatedEvent = catalogEvents.find((e: any) => e.event_id === event.event_id);
      if (updatedEvent) setEvent(updatedEvent);
    } catch (error: any) {
      console.error('Failed to register:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to register for event';
      toast.error('Registration Failed', { description: errorMessage });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!event) return;

    try {
      setIsRegistering(true);
      await registrationsService.cancelRegistration(event.event_id);
      
      setIsRegistered(false);
      setRegistrationStatus(null);
      
      toast.success('Registration Cancelled', {
        description: `Your registration for "${event.title}" has been cancelled.`,
      });
      
      // Refresh event data
      const catalogEvents = await eventsService.getCatalog();
      const updatedEvent = catalogEvents.find((e: any) => e.event_id === event.event_id);
      if (updatedEvent) setEvent(updatedEvent);
    } catch (error: any) {
      console.error('Failed to cancel registration:', error);
      toast.error('Cancellation Failed', {
        description: error?.response?.data?.detail || 'Failed to cancel registration',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={displayEvent.displayImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6"
        >
          <Button
            variant="secondary"
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/20"
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </motion.div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Badge className={`${categoryColors[event.category || 'academic']} mb-4`} variant="outline">
              {displayEvent.displayCategory}
            </Badge>
            <h1 className="text-white mb-4">{event.title}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {event.organizer_email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {displayEvent.attendeeCount} / {event.capacity} registered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-8">
                <h2 className="text-[#E21833] mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {event.description || 'No description available.'}
                </p>

                {/* Tags - Backend doesn't have tags field */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-muted">
                    <Tag className="w-3 h-3 mr-1" />
                    {displayEvent.displayCategory}
                  </Badge>
                  {event.is_paid && (
                    <Badge variant="secondary" className="bg-muted">
                      <DollarSign className="w-3 h-3 mr-1" />
                      Paid Event
                    </Badge>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Event Time Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8">
                <h2 className="text-[#E21833] mb-6">Event Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date</p>
                      <p className="font-medium">{displayEvent.formattedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Time</p>
                      <p className="font-medium">{displayEvent.formattedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Capacity</p>
                      <p className="font-medium">{displayEvent.attendeeCount} / {event.capacity} registered</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Organizer Info */}
            {event.organizer_email && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-8">
                  <h2 className="text-[#E21833] mb-4">Organizer</h2>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Contact</p>
                      <p className="font-medium">{event.organizer_email}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Registration & Payment */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Event Info Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6">
                  <h3 className="mb-6">Event Details</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Date</p>
                        <p className="font-medium">{displayEvent.formattedDate}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Time</p>
                        <p className="font-medium">{displayEvent.formattedTime}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Location</p>
                        <p className="font-medium">{event.location}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Contact</p>
                        <p className="font-medium">{event.organizer_email}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Price</p>
                        <p className="font-medium text-2xl">
                          {isFree ? 'Free' : `$${(event.price || 0).toFixed(2)}`}
                        </p>
                      </div>
                    </div>

                    {/* Availability Status */}
                    {isAlmostFull && (
                      <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <p className="text-sm text-orange-800 dark:text-orange-300 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Only {spotsLeft} spots left!
                        </p>
                      </div>
                    )}

                    {isFull && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-300 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Event is full
                        </p>
                      </div>
                    )}
                  </div>

                  {!isRegistered ? (
                    <Button
                      className="w-full mt-6 bg-[#E21833] hover:bg-[#C11528]"
                      size="lg"
                      onClick={handleRegister}
                      disabled={isFull || isRegistering}
                    >
                      {isRegistering ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </span>
                      ) : isFull ? (
                        'Event Full'
                      ) : (
                        `Register Now${isFree ? ' (Free)' : ` ($${(event.price || 0).toFixed(2)})`}`
                      )}
                    </Button>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {registrationStatus === 'waitlisted' ? (
                        <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                          <p className="text-sm text-orange-800 dark:text-orange-300 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            You're on the waitlist
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            You're registered
                          </p>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleCancelRegistration}
                        disabled={isRegistering}
                      >
                        {isRegistering ? 'Cancelling...' : 'Cancel Registration'}
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
