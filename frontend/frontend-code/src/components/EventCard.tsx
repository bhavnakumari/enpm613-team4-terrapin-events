import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
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

export function EventCard({ event, onViewDetails, onToggleRSVP }: EventCardProps) {
  const spotsLeft = event.maxAttendees - event.attendees;
  const isAlmostFull = spotsLeft <= 10 && spotsLeft > 0;
  const isFull = spotsLeft <= 0;
  
console.log('Rendering EventCard for event:', event);
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <Badge className={categoryColors[event.category]} variant="outline">
            {event.category}
          </Badge>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        <div>
          <h3 className="mb-2">{event.title}</h3>
          <p className="text-gray-600 line-clamp-2">{event.description}</p>
        </div>

        <div className="space-y-2 text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              {event.attendees} / {event.maxAttendees} attendees
              {isAlmostFull && <span className="text-orange-600 ml-1">(Almost full!)</span>}
              {isFull && <span className="text-red-600 ml-1">(Full)</span>}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails(event)}
          >
            View Details
          </Button>
          <Button
            className="flex-1 bg-[#E21833] hover:bg-[#C11528]"
            variant={event.isRegistered ? "secondary" : "default"}
            onClick={() => onToggleRSVP(event.id)}
          >
            {event.isRegistered ? 'Cancel RSVP' : isFull ? 'Join Waitlist' : 'RSVP'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
