import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Calendar, MapPin, DollarSign, Image as ImageIcon, FileText, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { eventsService } from '../services/events.service';
import type { EventCategory } from '../types/event';

const steps = [
  { id: 1, title: 'Basic Info', icon: FileText },
  { id: 2, title: 'Date & Time', icon: Calendar },
  { id: 3, title: 'Location', icon: MapPin },
  { id: 4, title: 'Pricing', icon: DollarSign },
  { id: 5, title: 'Media', icon: ImageIcon },
  { id: 6, title: 'Settings', icon: Settings },
  { id: 7, title: 'Review', icon: Check },
];

export function CreateEventWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: '',
    description: '',
    category: 'academic' as EventCategory,
    
    // Step 2: Date & Time
    date: '',
    startTime: '',
    endTime: '',
    registrationOpenDate: '',
    registrationOpenTime: '',
    registrationCloseDate: '',
    registrationCloseTime: '',
    
    // Step 3: Location
    location: '',
    
    // Step 4: Pricing
    isFree: true,
    price: '',
    maxAttendees: '',
    
    // Step 5: Media
    imageUrl: '',
    
    // Step 6: Settings
    requiresApproval: true,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    try {
      setIsSubmitting(true);

      // Validation
      if (!formData.title.trim()) {
        toast.error('Please enter an event title');
        setCurrentStep(1);
        return;
      }

      if (!formData.location.trim()) {
        toast.error('Please enter a location');
        setCurrentStep(3);
        return;
      }

      if (!formData.date || !formData.startTime) {
        toast.error('Please set the event date and start time');
        setCurrentStep(2);
        return;
      }

      if (!formData.maxAttendees || parseInt(formData.maxAttendees) <= 0) {
        toast.error('Please set a valid maximum number of attendees');
        setCurrentStep(4);
        return;
      }

      // Build ISO datetime strings
      const startDateTime = `${formData.date}T${formData.startTime}:00`;
      const endDateTime = formData.endTime ? `${formData.date}T${formData.endTime}:00` : undefined;
      
      const registrationOpenDateTime = (formData.registrationOpenDate && formData.registrationOpenTime) 
        ? `${formData.registrationOpenDate}T${formData.registrationOpenTime}:00` 
        : undefined;
      
      const registrationCloseDateTime = (formData.registrationCloseDate && formData.registrationCloseTime) 
        ? `${formData.registrationCloseDate}T${formData.registrationCloseTime}:00` 
        : undefined;

      // Prepare API request
      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        location: formData.location,
        banner: formData.imageUrl || undefined,
        start_time: startDateTime,
        end_time: endDateTime,
        registration_open_time: registrationOpenDateTime,
        registration_close_time: registrationCloseDateTime,
        capacity: parseInt(formData.maxAttendees),
        status: saveAsDraft ? 'draft' as const : (formData.requiresApproval ? 'pending_approval' as const : 'approved' as const),
        is_paid: !formData.isFree,
        price: formData.isFree ? undefined : parseFloat(formData.price),
        currency: formData.isFree ? undefined : 'USD',
      };

      // Call API
      const createdEvent = await eventsService.createEvent(eventData);

      // Success feedback
      if (saveAsDraft) {
        toast.success('Event saved as draft successfully!');
        navigate('/organiser-home');
      } else if (formData.requiresApproval) {
        toast.success('Event submitted for approval!', {
          description: 'You will be notified once an admin reviews your event.',
        });
        navigate('/organiser-home');
      } else {
        toast.success('Event created and published!');
        navigate('/events');
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-[#E21833]">Create New Event</h1>
          <p className="text-muted-foreground">Follow the steps below to create your campus event</p>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8">
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Step {currentStep} of {steps.length}</span>
              <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isCompleted
                        ? 'bg-[#E21833] text-white'
                        : isCurrent
                        ? 'bg-[#E21833]/10 text-[#E21833] border-2 border-[#E21833]'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs text-center ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute h-0.5 w-[calc(100%/7)] left-[calc(${index}/7*100%+5%)] top-5 ${
                        isCompleted ? 'bg-[#E21833]' : 'bg-muted'
                      }`}
                      style={{ left: `calc(${(index / steps.length) * 100}% + ${100 / steps.length / 2}%)` }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Form Content */}
        <Card className="p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4">Basic Information</h3>
                <p className="text-muted-foreground mb-6">Tell us about your event</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="e.g., Annual Tech Symposium 2025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe your event in detail..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value: string) => updateFormData('category', value as EventCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4">Date & Time</h3>
                <p className="text-muted-foreground mb-6">When will your event take place?</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Event Schedule</h4>
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData('date', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => updateFormData('startTime', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => updateFormData('endTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Registration Period (Optional)</h4>
                <p className="text-sm text-muted-foreground">Set when students can register for this event</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationOpenDate">Opens On</Label>
                    <Input
                      id="registrationOpenDate"
                      type="date"
                      value={formData.registrationOpenDate}
                      onChange={(e) => updateFormData('registrationOpenDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationOpenTime">Opens At</Label>
                    <Input
                      id="registrationOpenTime"
                      type="time"
                      value={formData.registrationOpenTime}
                      onChange={(e) => updateFormData('registrationOpenTime', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationCloseDate">Closes On</Label>
                    <Input
                      id="registrationCloseDate"
                      type="date"
                      value={formData.registrationCloseDate}
                      onChange={(e) => updateFormData('registrationCloseDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationCloseTime">Closes At</Label>
                    <Input
                      id="registrationCloseTime"
                      type="time"
                      value={formData.registrationCloseTime}
                      onChange={(e) => updateFormData('registrationCloseTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> Make sure to allow enough time for setup and cleanup. Consider adding buffer time for attendees to arrive.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4">Location Details</h3>
                <p className="text-muted-foreground mb-6">Where will your event be held?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="e.g., Stamp Student Union, Room 2400"
                />
                <p className="text-xs text-muted-foreground">
                  Include building name, room number, and any other relevant details
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4">Pricing & Capacity</h3>
                <p className="text-muted-foreground mb-6">Set ticket pricing and attendance limits</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label htmlFor="isFree">Free Event</Label>
                  <p className="text-sm text-muted-foreground">Is this event free to attend?</p>
                </div>
                <Switch
                  id="isFree"
                  checked={formData.isFree}
                  onCheckedChange={(checked: boolean) => updateFormData('isFree', checked)}
                />
              </div>

              {!formData.isFree && (
                <div className="space-y-2">
                  <Label htmlFor="price">Ticket Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Maximum Attendees *</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => updateFormData('maxAttendees', e.target.value)}
                  placeholder="e.g., 100"
                  min="1"
                />
              </div>
            </div>
          )}

          {/* Step 5: Media */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4">Event Media</h3>
                <p className="text-muted-foreground mb-6">Add images to showcase your event</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Cover Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => updateFormData('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1200x630px for best results
                </p>
              </div>

              {formData.imageUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Event preview"
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Settings */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4">Event Settings</h3>
                <p className="text-muted-foreground mb-6">Configure additional options</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Require Admin Approval</Label>
                    <p className="text-sm text-muted-foreground">Event must be approved before going live</p>
                  </div>
                  <Switch
                    checked={formData.requiresApproval}
                    onCheckedChange={(checked: boolean) => updateFormData('requiresApproval', checked)}
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 rounded-lg">
                <p className="text-sm">
                  {formData.requiresApproval 
                    ? '✓ Your event will be submitted for admin approval and published after review.' 
                    : '⚠️ Your event will be published immediately without admin review.'}
                </p>
              </div>
            </div>
          )}

          {/* Step 7: Review */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4">Review & Submit</h3>
                <p className="text-muted-foreground mb-6">Please review your event details before submitting</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span>{formData.title || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge>{formData.category}</Badge>
                    </div>
                    {formData.description && (
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Description:</span>
                        <span className="text-xs">{formData.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-3">Date & Time</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{formData.date || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span>{formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : formData.startTime || 'Not set'}</span>
                    </div>
                    {formData.registrationOpenDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registration Opens:</span>
                        <span>{formData.registrationOpenDate} {formData.registrationOpenTime}</span>
                      </div>
                    )}
                    {formData.registrationCloseDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registration Closes:</span>
                        <span>{formData.registrationCloseDate} {formData.registrationCloseTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-3">Location</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{formData.location || 'Not set'}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-3">Pricing & Capacity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span>{formData.isFree ? 'Free' : `$${formData.price}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Attendees:</span>
                      <span>{formData.maxAttendees || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#E21833]/10 dark:bg-[#C11528]/20 border border-[#E21833]/20 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> {formData.requiresApproval ? 'Your event will be submitted for admin approval. You will receive an email notification once it has been reviewed.' : 'Your event will be published immediately.'}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Draft'}
              </Button>
              
              {currentStep < steps.length ? (
                <Button 
                  onClick={nextStep} 
                  className="bg-[#E21833] hover:bg-[#C11528]"
                  disabled={isSubmitting}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={() => handleSubmit(false)} 
                  className="bg-[#E21833] hover:bg-[#C11528]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Event'}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
