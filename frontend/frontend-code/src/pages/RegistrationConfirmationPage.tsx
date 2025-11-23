import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Clock, Download, Share2, Mail, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';

export function RegistrationConfirmationPage() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Receive from navigation state: { registration, event, amount?, ticketNumber? }
  const { registration: regData, event, amount, ticketNumber } = location.state || {};

  // Redirect if no registration data
  if (!regData || !event) {
    return <Navigate to="/events" replace />;
  }

  const isPaidEvent = event.price && event.price > 0;
  const isWaitlisted = regData.status === 'waitlisted';

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success/Waitlist Message */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 ${isWaitlisted ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-green-100 dark:bg-green-900/20'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {isWaitlisted ? (
              <AlertCircle className="w-12 h-12 text-orange-600 dark:text-orange-500" />
            ) : (
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500" />
            )}
          </div>
          <h1 className="mb-2">
            {isWaitlisted ? "You're on the Waitlist!" : "Registration Confirmed!"}
          </h1>
          {isWaitlisted ? (
            <div>
              <p className="text-xl text-muted-foreground mb-3">
                {event.title} is currently at full capacity
              </p>
              <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300">
                Waitlist Position: #{regData.waitlist_position || 'TBD'}
              </Badge>
            </div>
          ) : (
            <p className="text-xl text-muted-foreground">
              You're all set for {event.title}
            </p>
          )}
        </div>

        {/* Confirmation Details */}
        <Card className="p-8 mb-6">
          <div className="text-center mb-6">
            {ticketNumber && !isWaitlisted && (
              <div className="inline-block px-4 py-2 bg-muted rounded-lg mb-4">
                <p className="text-sm text-muted-foreground mb-1">Ticket Number</p>
                <p className="font-mono text-xl">{ticketNumber}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {isWaitlisted 
                ? `We'll notify you at ${user?.email} if a spot becomes available`
                : `A confirmation email has been sent to ${user?.email}`
              }
            </p>
          </div>

          <Separator className="my-6" />

          {/* Event Details */}
          <div className="space-y-4 mb-6">
            <h3>Event Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">Date</p>
                  <p className="text-sm text-muted-foreground">{event.formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">Time</p>
                  <p className="text-sm text-muted-foreground">{event.formattedTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {event.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isPaidEvent && amount && !isWaitlisted && (
            <>
              <Separator className="my-6" />

              {/* Payment Summary */}
              <div className="space-y-4">
                <h4>Payment Summary</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span>${amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration ID</span>
                    <span className="font-mono text-xs">{regData.registration_id}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download Ticket
          </Button>
          <Button variant="outline" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Ticket
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share Event
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h4 className="mb-3">What's Next?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {isWaitlisted ? (
                <>
                  <li>• You'll receive an email if a spot opens up</li>
                  <li>• Your waitlist position is #{regData.waitlist_position || 'TBD'}</li>
                  <li>• Check your profile for waitlist status updates</li>
                  <li>• We'll notify you at least 24 hours before the event</li>
                </>
              ) : (
                <>
                  <li>• Your ticket has been emailed to you</li>
                  <li>• Add the event to your calendar</li>
                  <li>• We'll send you a reminder 24 hours before</li>
                  <li>• {isPaidEvent ? 'Bring your ticket (digital or printed)' : 'Check in at the event'}</li>
                </>
              )}
            </ul>
          </Card>

          <Card className="p-6">
            <h4 className="mb-3">Need Help?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about your registration or the event, we're here to help.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:support@umd.edu">Contact Support</a>
            </Button>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/profile">
            <Button variant="outline">View My Registrations</Button>
          </Link>
          <Link to="/events">
            <Button className="bg-[#E21833] hover:bg-[#C11528]">Browse More Events</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
