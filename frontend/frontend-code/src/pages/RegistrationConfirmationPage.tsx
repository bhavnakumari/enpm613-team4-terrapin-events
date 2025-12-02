import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Clock, Download, Share2, Mail, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config/env';
import { useState } from 'react';

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
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Helpers to resolve IDs/URLs
  const getEventId = (): string | null => {
    const eventId: string | undefined =
      event.event_id || event.id || event.eventId;

    if (!eventId) {
      console.error('No event_id found on event:', event);
      return null;
    }

    return eventId;
  };

  const getTicketUrl = (): string | null => {
    const eventId = getEventId();
    if (!eventId) {
      alert('Unable to determine event ID for ticket actions.');
      return null;
    }
    return `${config.apiUrl}/api/events/${eventId}/ticket`;
  };

  const getEventUrl = (): string | null => {
    const eventId = getEventId();
    if (!eventId) {
      alert('Unable to determine event ID for sharing.');
      return null;
    }
    return `${window.location.origin}/events/${eventId}`;
  };

  const handleDownloadTicket = async () => {
    const url = getTicketUrl();
    if (!url) return;

    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        credentials: 'include',
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Ticket fetch failed:', res.status, text);
        alert(
          'Failed to load ticket. Please make sure you are logged in and registered for this event.'
        );
        return;
      }

      const html = await res.text();
      const ticketWindow = window.open('', '_blank');

      if (ticketWindow) {
        ticketWindow.document.open();
        ticketWindow.document.write(html);
        ticketWindow.document.close();
      } else {
        const blob = new Blob([html], { type: 'text/html' });
        const blobUrl = window.URL.createObjectURL(blob);
        window.location.href = blobUrl;
      }
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Error downloading ticket');
    }
  };

  const handleEmailTicket = () => {
    const ticketUrl = getTicketUrl();
    if (!ticketUrl) return;

    const to = user?.email ?? '';
    const subject = encodeURIComponent(`Your ticket for ${event.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nHere is your ticket link for "${event.title}":\n\n${ticketUrl}\n\nEvent Date: ${event.formattedDate}\nTime: ${event.formattedTime}\nLocation: ${event.location}\n\nThank you!`
    );

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const handleShareButtonClick = () => {
    setShowShareOptions(prev => !prev);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleDownloadTicket}
            disabled={isWaitlisted}
          >
            <Download className="w-4 h-4" />
            Download Ticket
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={handleEmailTicket}
            disabled={isWaitlisted}
          >
            <Mail className="w-4 h-4" />
            Email Ticket
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={handleShareButtonClick}
          >
            <Share2 className="w-4 h-4" />
            Share Event
          </Button>
        </div>

                {showShareOptions && (
          <Card className="p-4 mb-8">
            {(() => {
              const eventUrl = getEventUrl() || window.location.origin;

              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Join me at "${event.title}"!`
              )}&url=${encodeURIComponent(eventUrl)}`;

              const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                eventUrl
              )}`;

              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                `Check out this event: "${event.title}" - ${eventUrl}`
              )}`;

              const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                eventUrl
              )}`;

              return (
                <>
                  <p className="text-sm text-muted-foreground mb-3">
                    Share this event with your friends:
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Button variant="outline" size="sm" asChild>
                      <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                        X / Twitter
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                        LinkedIn
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
                        Facebook
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const urlToCopy = eventUrl;
                        if (navigator.clipboard) {
                          try {
                            await navigator.clipboard.writeText(urlToCopy);
                            alert('Event link copied to clipboard!');
                          } catch (err) {
                            console.error('Clipboard write failed:', err);
                            alert(urlToCopy);
                          }
                        } else {
                          alert(urlToCopy);
                        }
                      }}
                    >
                      Copy Link
                    </Button>
                  </div>
                </>
              );
            })()}
          </Card>
        )}

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
