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
import { motion } from 'motion/react';
import umdCampusImage from 'figma:asset/1e936f81658f5456b943e5e74b3d3e7592e48a81.png';

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
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: '',
    description: '',
    category: 'Academic' as const,
    organizer: '',
    contactEmail: '',
    
    // Step 2: Date & Time
    date: '',
    startTime: '',
    endTime: '',
    
    // Step 3: Location
    venue: '',
    address: '',
    roomNumber: '',
    
    // Step 4: Pricing
    isFree: true,
    price: '',
    maxAttendees: '',
    
    // Step 5: Media
    imageUrl: '',
    videoUrl: '',
    
    // Step 6: Settings
    requiresApproval: true,
    allowWaitlist: true,
    sendReminders: true,
    tags: '',
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

  const handleSubmit = () => {
    console.log('Event created:', formData);
    navigate('/events');
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-48 overflow-hidden"
      >
        <img
          src={umdCampusImage}
          alt="UMD Campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E21833]/90 to-[#C11528]/80 dark:from-[#C11528]/90 dark:to-[#A01020]/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-2 text-white"
            >
              Create New Event
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl text-white/90"
            >
              Bring your campus event to life
            </motion.p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
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
        </motion.div>

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
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe your event in detail..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Career">Career</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizer">Organizer *</Label>
                  <Input
                    id="organizer"
                    value={formData.organizer}
                    onChange={(e) => updateFormData('organizer', e.target.value)}
                    placeholder="Organization or club name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateFormData('contactEmail', e.target.value)}
                  placeholder="contact@example.com"
                />
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
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => updateFormData('endTime', e.target.value)}
                  />
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
                <Label htmlFor="venue">Venue Name *</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => updateFormData('venue', e.target.value)}
                  placeholder="e.g., Main Auditorium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  placeholder="e.g., Building A, University of Maryland"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number (Optional)</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => updateFormData('roomNumber', e.target.value)}
                  placeholder="e.g., Room 301"
                />
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
                  onCheckedChange={(checked) => updateFormData('isFree', checked)}
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
                <p className="text-muted-foreground mb-6">Add images and videos to showcase your event</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Cover Image URL</Label>
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

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => updateFormData('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
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
                    onCheckedChange={(checked) => updateFormData('requiresApproval', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Allow Waitlist</Label>
                    <p className="text-sm text-muted-foreground">Let students join waitlist when event is full</p>
                  </div>
                  <Switch
                    checked={formData.allowWaitlist}
                    onCheckedChange={(checked) => updateFormData('allowWaitlist', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Send Reminders</Label>
                    <p className="text-sm text-muted-foreground">Email reminders to registered attendees</p>
                  </div>
                  <Switch
                    checked={formData.sendReminders}
                    onCheckedChange={(checked) => updateFormData('sendReminders', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => updateFormData('tags', e.target.value)}
                  placeholder="e.g., technology, innovation, networking"
                />
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Organizer:</span>
                      <span>{formData.organizer || 'Not set'}</span>
                    </div>
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
                      <span>{formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : 'Not set'}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-3">Location</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venue:</span>
                      <span>{formData.venue || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span>{formData.address || 'Not set'}</span>
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
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/events')}>
                Save Draft
              </Button>
              
              {currentStep < steps.length ? (
                <Button onClick={nextStep} className="bg-[#E21833] hover:bg-[#C11528]">
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-[#E21833] hover:bg-[#C11528]">
                  Submit Event
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