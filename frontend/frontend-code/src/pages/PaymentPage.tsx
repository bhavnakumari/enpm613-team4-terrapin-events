import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Check, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';

export function PaymentPage() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const eventDetails = {
    title: 'Annual Tech Symposium 2025',
    date: 'December 15, 2025',
    time: '9:00 AM - 5:00 PM',
    location: 'Main Auditorium, Building A',
    price: 25.00,
    serviceFee: 2.50,
  };

  const total = eventDetails.price + eventDetails.serviceFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    // Process payment
    navigate('/registration-confirmation');
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-[#E21833]">Complete Your Registration</h1>
          <p className="text-muted-foreground">Secure payment powered by UMD</p>
        </div>

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
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
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
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Complete Payment
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
                  <h4 className="mb-1">{eventDetails.title}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{eventDetails.date}</p>
                    <p>{eventDetails.time}</p>
                    <p>{eventDetails.location}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ticket Price</span>
                    <span>${eventDetails.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service Fee</span>
                    <span>${eventDetails.serviceFee.toFixed(2)}</span>
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
