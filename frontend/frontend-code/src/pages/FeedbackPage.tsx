import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { config } from '../config/env';
import { toast } from 'sonner';


type FeedbackQuestion = {
  key: string;
  label: string;
};

const QUESTIONS: FeedbackQuestion[] = [
  { key: 'overall_satisfaction', label: 'Overall satisfaction with the event' },
  { key: 'content_quality', label: 'Quality and relevance of the content' },
  { key: 'speaker_quality', label: 'Speakers / facilitators' },
  { key: 'organization', label: 'Event organization and logistics' },
  { key: 'venue_experience', label: 'Venue / platform (audio, seating, accessibility, etc.)' },
  { key: 'networking', label: 'Networking / interaction opportunities' },
  { key: 'usefulness', label: 'Usefulness for your academic / professional goals' },
  { key: 'recommendation', label: 'Likelihood to recommend this event to a friend' },
  { key: 'attend_again', label: 'Likelihood to attend similar events in future' },
  { key: 'expectations', label: 'Event met your expectations' },
];

export function FeedbackPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const registrationId = searchParams.get('registration_id');

  const [ratings, setRatings] = useState<Record<string, number>>(
    () =>
      QUESTIONS.reduce((acc, q) => {
        acc[q.key] = 8; // default value so sliders aren’t all at 0
        return acc;
      }, {} as Record<string, number>)
  );
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!eventId || !registrationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="max-w-lg w-full p-6 text-center">
          <h1 className="mb-2">Invalid feedback link</h1>
          <p className="text-muted-foreground">
            This feedback link is missing some required information. Please check the email you
            received or contact the event organizer.
          </p>
        </Card>
      </div>
    );
  }

  const handleRatingChange = (key: string, value: number[]) => {
    setRatings(prev => ({
      ...prev,
      [key]: value[0],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`${config.apiUrl}/api/events/${eventId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registration_id: registrationId,
          ratings,
          comments,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Feedback submit failed:', res.status, text);
        toast.error('Failed to submit feedback. This link may have expired or is not valid.');
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error('Something went wrong while submitting your feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="max-w-lg w-full p-6 text-center space-y-3">
          <h1>Thank you! 🎉</h1>
          <p className="text-muted-foreground">
            Your feedback has been recorded. We really appreciate you taking the time to help us
            improve future events.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="p-6 md:p-8 space-y-6">
          <div>
            <h1 className="mb-1">Event Feedback</h1>
            <p className="text-sm text-muted-foreground">
              Please rate the following aspects of the event on a scale from <strong>1</strong> (Very
              poor) to <strong>10</strong> (Excellent). Your responses are anonymous and help us
              improve future events.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
                {QUESTIONS.map(q => (
                  <div key={q.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm md:text-base">{q.label}</Label>
                      <span className="text-xs text-muted-foreground">
                        {ratings[q.key] ?? 0} / 10
                      </span>
                    </div>

                    <select
                      className="w-full md:w-40 border rounded-md px-3 py-2 bg-background text-sm"
                      value={ratings[q.key] ?? 1}
                      onChange={(e) =>
                        setRatings((prev) => ({
                          ...prev,
                          [q.key]: Number(e.target.value),
                        }))
                      }
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>

                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>1 = Very poor</span>
                      <span>10 = Excellent</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Additional comments (optional)</Label>
              <Textarea
                id="comments"
                placeholder="Anything that worked really well? Anything we should improve next time?"
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto bg-[#E21833] hover:bg-[#C11528]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}