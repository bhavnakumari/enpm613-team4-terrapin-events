import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { CreditCard, Lock, Check, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { registrationsService } from '../services/registrations.service';
import { toast } from 'sonner';

export function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment form fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Redirect if no event data
  if (!event) {
    return <Navigate to="/events" replace />;
  }

  const serviceFee = 2.50;
  const total = (event.price || 0) + serviceFee;
  const spotsLeft = event.capacity - (event.attendeeCount || 0);
  const showCapacityWarning = spotsLeft > 0 && spotsLeft <= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    
    // Validate payment fields
    if (!cardNumber || !expiryMonth || !expiryYear || !cvc || !cardholderName) {
      toast.error('Please fill in all payment fields');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Prepare payment data for backend
      const paymentData = {
        card_number: cardNumber.replace(/\s/g, ''), // Remove spaces
        expiry_month: parseInt(expiryMonth),
        expiry_year: parseInt(expiryYear),
        cvc: cvc,
      };
      
      // Register for event with payment data
      const registration = await registrationsService.registerForEvent(event.event_id, paymentData);
      
      // Navigate to confirmation page with registration data
      navigate('/registration-confirmation', {
        state: {
          registration,
          event,
          amount: total,
          ticketNumber: `TKT-${Date.now()}`,
        },
      });
      
      toast.success('Payment Successful!');
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Registration failed';
      
      // Check if event became full
      if (errorMessage.toLowerCase().includes('full') || errorMessage.toLowerCase().includes('capacity')) {
        toast.error('Event Filled Up', {
          description: 'This event filled up while you were completing payment. Your payment will be refunded within 3-5 business days.',
          duration: 6000,
        });
        setTimeout(() => navigate(`/events/${event.event_id}`), 2000);
      } else if (errorMessage.toLowerCase().includes('already registered')) {
        toast.error('Already Registered', {
          description: 'You are already registered for this event.',
        });
        navigate(`/events/${event.event_id}`);
      } else {
        toast.error('Registration Failed', {
          description: errorMessage,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-[#E21833]">Complete Your Registration</h1>
          <p className="text-muted-foreground">Secure payment powered by UMD</p>
        </div>

        {/* Capacity Warning */}
        {showCapacityWarning && (
          <Card className="mb-6 p-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-orange-900 dark:text-orange-100 mb-1">Limited Spots Remaining</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Only {spotsLeft} spots left! Complete your payment quickly to secure your registration.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="mb-6">Payment Method</h3>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Credit / Debit Card
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                    PayPal
                  </Label>
                </div>
              </RadioGroup>
            </Card>

            {paymentMethod === 'credit_card' && (
              <Card className="p-6">
                <h3 className="mb-6">Card Information</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242 (test card)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth">Month</Label>
                      <Input
                        id="expiryMonth"
                        placeholder="12"
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                        maxLength={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiryYear">Year</Label>
                      <Input
                        id="expiryYear"
                        placeholder="2030"
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                        maxLength={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <h4 className="mb-4">Billing Information</h4>

                  <div className="space-y-2">
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input
                      id="name"
                      placeholder="John Terp"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@umd.edu"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Billing Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="College Park"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        placeholder="20742"
                        required
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I agree to the{' '}
                      <a href="#" className="text-[#E21833] hover:underline">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-[#E21833] hover:underline">
                        Cancellation Policy
                      </a>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#E21833] hover:bg-[#C11528]"
                    size="lg"
                    disabled={!agreeToTerms || isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Complete Payment
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Your payment information is secure and encrypted
                  </p>
                </form>
              </Card>
            )}

            {paymentMethod === 'paypal' && (
              <Card className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.03.17a.804.804 0 01-.794.679H7.72a.483.483 0 01-.477-.558L7.418 21h1.99l.57-3.62h1.992c3.238 0 5.774-1.314 6.514-5.12.257-1.313.193-2.447-.3-3.327" />
                    </svg>
                  </div>
                  <h3 className="mb-2">Continue with PayPal</h3>
                  <p className="text-muted-foreground mb-6">
                    You'll be redirected to PayPal to complete your payment
                  </p>
                  <Button
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Continue to PayPal
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="mb-1">{event.title}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{event.formattedDate}</p>
                    <p>{event.formattedTime}</p>
                    <p>{event.location}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ticket Price</span>
                    <span>${(event.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service Fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="text-[#E21833]">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Instant confirmation</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Email ticket delivery</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}