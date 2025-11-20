export interface Event {
  id: string;
  title: string;
  description: string;
  category: 'Academic' | 'Social' | 'Sports' | 'Workshop' | 'Cultural' | 'Career';
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  attendees: number;
  maxAttendees: number;
  organizer: string;
  organizerId: string;
  isRegistered?: boolean;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  price?: number;
  tags?: string[];
  contactEmail?: string;
  requirements?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'organizer' | 'admin';
  avatar?: string;
  registeredEvents: string[];
  createdEvents: string[];
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus?: 'pending' | 'completed' | 'refunded';
  ticketNumber?: string;
}

export interface Payment {
  id: string;
  registrationId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'credit_card' | 'debit_card' | 'paypal';
  transactionId?: string;
  createdAt: string;
}
