import { useState } from 'react';
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
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';

// Mock event data - in a real app, this would come from an API
const mockEvents = [
  {
    id: '1',
    title: 'Annual Tech Symposium 2025',
    description: 'Join us for a day of innovation and technology talks featuring industry leaders and cutting-edge research presentations. This comprehensive symposium will cover the latest trends in AI, machine learning, web development, and cybersecurity. Network with professionals and fellow students passionate about technology.',
    category: 'Academic',
    date: 'December 15, 2025',
    time: '9:00 AM - 5:00 PM',
    location: 'Main Auditorium, Building A',
    imageUrl: 'https://images.unsplash.com/photo-1760420940953-3958ad9f6287?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwY29uZmVyZW5jZSUyMHdvcmtzaG9wfGVufDF8fHx8MTc2MzE3NTM1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    attendees: 145,
    maxAttendees: 200,
    organizer: 'Computer Science Club',
    organizerId: 'org-1',
    contactEmail: 'cs-club@umd.edu',
    price: 25.00,
    tags: ['Technology', 'Innovation', 'Networking', 'Career'],
    requirements: 'UMD student ID required for entry',
    schedule: [
      { time: '9:00 AM', activity: 'Registration & Breakfast' },
      { time: '10:00 AM', activity: 'Keynote: Future of AI' },
      { time: '11:30 AM', activity: 'Workshop Sessions' },
      { time: '1:00 PM', activity: 'Lunch & Networking' },
      { time: '2:30 PM', activity: 'Panel Discussion' },
      { time: '4:00 PM', activity: 'Q&A and Closing Remarks' }
    ],
    speakers: [
      { name: 'Dr. Sarah Johnson', role: 'AI Research Lead, Google' },
      { name: 'Michael Chen', role: 'CTO, Tech Startup' },
      { name: 'Prof. Robert Williams', role: 'CS Department, UMD' }
    ]
  },
  {
    id: '2',
    title: 'Welcome Week Social Mixer',
    description: 'Meet new friends and connect with fellow students! Enjoy food, music, and fun activities. Perfect for freshmen and transfer students.',
    category: 'Social',
    date: 'November 20, 2025',
    time: '6:00 PM - 9:00 PM',
    location: 'Student Center Plaza',
    imageUrl: 'https://images.unsplash.com/photo-1632834380561-d1e05839a33a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzYzMDcyMjI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    attendees: 87,
    maxAttendees: 150,
    organizer: 'Student Council',
    organizerId: 'org-2',
    contactEmail: 'student-council@umd.edu',
    price: 0,
    tags: ['Social', 'Networking', 'Welcome Week'],
    requirements: 'None - Open to all students'
  },
  {
    id: '3',
    title: 'Intramural Basketball Tournament',
    description: 'Show off your skills in our annual basketball tournament. Teams of 5 compete for the championship trophy and bragging rights!',
    category: 'Sports',
    date: 'November 25, 2025',
    time: '2:00 PM - 8:00 PM',
    location: 'Recreation Center Courts',
    imageUrl: 'https://images.unsplash.com/photo-1762709753300-342ab94e8b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwc3BvcnRzJTIwZXZlbnR8ZW58MXx8fHwxNzYzMTc1MzU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    attendees: 96,
    maxAttendees: 100,
    organizer: 'Athletics Department',
    organizerId: 'org-3',
    contactEmail: 'athletics@umd.edu',
    price: 15.00,
    tags: ['Sports', 'Basketball', 'Competition'],
    requirements: 'Valid recreation center membership'
  }
];

const categoryColors = {
  Academic: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
  Social: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
  Sports: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300',
  Workshop: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300',
  Cultural: 'bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-950 dark:text-pink-300',
  Career: 'bg-red-50 text-[#E21833] border-red-200 dark:bg-red-950 dark:text-red-300',
};

export function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    agreeToTerms: false
  });

  // Find the event
  const event = mockEvents.find(e => e.id === id);

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

  const spotsLeft = event.maxAttendees - event.attendees;
  const isAlmostFull = spotsLeft <= 10 && spotsLeft > 0;
  const isFull = spotsLeft <= 0;
  const isFree = event.price === 0;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/registration-confirmation', {
        state: {
          event: event,
          ticketNumber: `TKT-${Date.now()}`,
          amount: event.price
        }
      });
    }, 2000);
  };

  const handleRegister = () => {
    if (isFree) {
      // For free events, skip payment
      navigate('/registration-confirmation', {
        state: {
          event: event,
          ticketNumber: `TKT-${Date.now()}`,
          amount: 0
        }
      });
    } else {
      // Show payment form
      setShowPayment(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={event.imageUrl}
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
            <Badge className={`${categoryColors[event.category]} mb-4`} variant="outline">
              {event.category}
            </Badge>
            <h1 className="text-white mb-4">{event.title}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {event.organizer}
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {event.attendees} / {event.maxAttendees} registered
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
                  {event.description}
                </p>

                {/* Tags */}
                {event.tags && (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-muted">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Schedule */}
            {event.schedule && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-8">
                  <h2 className="text-[#E21833] mb-6">Event Schedule</h2>
                  <div className="space-y-4">
                    {event.schedule.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-24 text-sm text-muted-foreground font-medium">
                          {item.time}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#E21833] mt-2" />
                            <p className="text-foreground">{item.activity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Speakers */}
            {event.speakers && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-8">
                  <h2 className="text-[#E21833] mb-6">Featured Speakers</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E21833] to-[#C11528] flex items-center justify-center text-white flex-shrink-0">
                          {speaker.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="mb-1">{speaker.name}</h4>
                          <p className="text-sm text-muted-foreground">{speaker.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Requirements */}
            {event.requirements && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-8">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="mb-2">Requirements</h3>
                      <p className="text-muted-foreground">{event.requirements}</p>
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
                        <p className="font-medium">{event.date}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Time</p>
                        <p className="font-medium">{event.time}</p>
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
                        <p className="font-medium">{event.contactEmail}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-[#E21833] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Price</p>
                        <p className="font-medium text-2xl">
                          {isFree ? 'Free' : `$${event.price?.toFixed(2)}`}
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

                  {!showPayment && (
                    <Button
                      className="w-full mt-6 bg-[#E21833] hover:bg-[#C11528]"
                      size="lg"
                      onClick={handleRegister}
                      disabled={isFull}
                    >
                      {isFull ? 'Event Full' : 'Register Now'}
                    </Button>
                  )}
                </Card>
              </motion.div>

              {/* Payment Form */}
              {showPayment && !isFree && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Shield className="w-5 h-5 text-[#E21833]" />
                      <h3>Secure Payment</h3>
                    </div>

                    <div className="space-y-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm">Personal Information</h4>
                        
                        <div>
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@umd.edu"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(123) 456-7890"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Payment Method */}
                      <div className="space-y-4">
                        <h4 className="text-sm">Payment Method</h4>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="credit_card" id="credit_card" />
                            <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                              <CreditCard className="w-4 h-4" />
                              Credit Card
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="debit_card" id="debit_card" />
                            <Label htmlFor="debit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                              <CreditCard className="w-4 h-4" />
                              Debit Card
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Separator />

                      {/* Card Details */}
                      <div className="space-y-4">
                        <h4 className="text-sm">Card Details</h4>
                        
                        <div>
                          <Label htmlFor="cardNumber">Card Number *</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                            maxLength={19}
                          />
                        </div>

                        <div>
                          <Label htmlFor="cardName">Name on Card *</Label>
                          <Input
                            id="cardName"
                            placeholder="JOHN DOE"
                            value={formData.cardName}
                            onChange={(e) => handleInputChange('cardName', e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiryDate">Expiry Date *</Label>
                            <Input
                              id="expiryDate"
                              placeholder="MM/YY"
                              value={formData.expiryDate}
                              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                              maxLength={5}
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              type="password"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange('cvv', e.target.value)}
                              maxLength={4}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="billingAddress">Billing Address *</Label>
                          <Input
                            id="billingAddress"
                            placeholder="123 Main St, College Park, MD"
                            value={formData.billingAddress}
                            onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Total */}
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-muted-foreground">Registration Fee</span>
                          <span className="font-medium">${event.price?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-muted-foreground">Processing Fee</span>
                          <span className="font-medium">$2.50</span>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total</span>
                          <span className="text-2xl font-bold text-[#E21833]">
                            ${((event.price || 0) + 2.50).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                        />
                        <Label htmlFor="terms" className="text-sm cursor-pointer">
                          I agree to the terms and conditions and confirm that all information provided is accurate
                        </Label>
                      </div>

                      {/* Payment Button */}
                      <Button
                        className="w-full bg-[#E21833] hover:bg-[#C11528]"
                        size="lg"
                        onClick={handlePayment}
                        disabled={!formData.agreeToTerms || isProcessing}
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing Payment...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Complete Registration
                          </span>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        Your payment is secure and encrypted. We do not store card details.
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
