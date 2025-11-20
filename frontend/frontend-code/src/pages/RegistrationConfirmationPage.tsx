import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Clock, Download, Share2, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

export function RegistrationConfirmationPage() {
  const registration = {
    ticketNumber: 'TS-2025-001234',
    event: {
      title: 'Annual Tech Symposium 2025',
      date: 'December 15, 2025',
      time: '9:00 AM - 5:00 PM',
      location: 'Main Auditorium, Building A',
      address: 'University of Maryland, College Park, MD 20742',
    },
    payment: {
      amount: 27.50,
      method: 'Credit Card ending in 3456',
      transactionId: 'TXN-20251115-789012',
    },
    attendee: {
      name: 'John Terp',
      email: 'john@umd.edu',
    },
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500" />
          </div>
          <h1 className="mb-2">Registration Confirmed!</h1>
          <p className="text-xl text-muted-foreground">
            You're all set for {registration.event.title}
          </p>
        </div>

        {/* Confirmation Details */}
        <Card className="p-8 mb-6">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 bg-muted rounded-lg mb-4">
              <p className="text-sm text-muted-foreground mb-1">Ticket Number</p>
              <p className="font-mono text-xl">{registration.ticketNumber}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to {registration.attendee.email}
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
                  <p className="text-sm text-muted-foreground">{registration.event.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">Time</p>
                  <p className="text-sm text-muted-foreground">{registration.event.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {registration.event.location}<br />
                    {registration.event.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Payment Summary */}
          <div className="space-y-4">
            <h4>Payment Summary</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span>${registration.payment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span>{registration.payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs">{registration.payment.transactionId}</span>
              </div>
            </div>
          </div>
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
              <li>• Your ticket has been emailed to you</li>
              <li>• Add the event to your calendar</li>
              <li>• We'll send you a reminder 24 hours before</li>
              <li>• Bring your ticket (digital or printed) to the event</li>
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
