import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Users, Clock, User } from 'lucide-react';
import { Event } from './EventCard';

interface EventDetailsDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleRSVP: (eventId: string) => void;
}

const categoryColors = {
  Academic: 'bg-blue-50 text-blue-800 border-blue-200',
  Social: 'bg-purple-50 text-purple-800 border-purple-200',
  Sports: 'bg-green-50 text-green-800 border-green-200',
  Workshop: 'bg-orange-50 text-orange-800 border-orange-200',
  Cultural: 'bg-pink-50 text-pink-800 border-pink-200',
  Career: 'bg-red-50 text-[#E21833] border-red-200',
};

export function EventDetailsDialog({ event, open, onOpenChange, onToggleRSVP }: EventDetailsDialogProps) {
  if (!event) return null;

  const spotsLeft = event.maxAttendees - event.attendees;
  const isFull = spotsLeft <= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="relative h-64 -mx-6 -mt-6 mb-6 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <Badge className={categoryColors[event.category]} variant="outline">
              {event.category}
            </Badge>
          </div>
        </div>

        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="mb-2 text-gray-900">About this event</h4>
            <p className="text-gray-600">{event.description}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-gray-900">Event Details</h4>
            
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-gray-900">Date</div>
                  <div className="text-gray-600">{event.date}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-gray-900">Time</div>
                  <div className="text-gray-600">{event.time}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-gray-900">Location</div>
                  <div className="text-gray-600">{event.location}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-gray-900">Organizer</div>
                  <div className="text-gray-600">{event.organizer}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-gray-900">Capacity</div>
                  <div className="text-gray-600">
                    {event.attendees} / {event.maxAttendees} registered
                    <span className="ml-2">
                      {isFull ? (
                        <span className="text-red-600">(Event is full)</span>
                      ) : (
                        <span className="text-green-600">({spotsLeft} spots left)</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 bg-[#E21833] hover:bg-[#C11528]"
              variant={event.isRegistered ? "secondary" : "default"}
              onClick={() => {
                onToggleRSVP(event.id);
                onOpenChange(false);
              }}
              disabled={isFull && !event.isRegistered}
            >
              {event.isRegistered ? 'Cancel Registration' : isFull ? 'Event Full' : 'Register Now'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
