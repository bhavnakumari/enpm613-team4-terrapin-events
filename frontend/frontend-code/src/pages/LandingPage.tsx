import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  TrendingUp,
  Shield,
  ArrowRight,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import umdHeroImage from "figma:asset/08fe0f7715edc9b07d709f5f204ee11cb38b8e2a.png";
import umdCampusImage from "figma:asset/a93c597979bc9f2022b9624ac797e04f963270c6.png";

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const features = [
    {
      icon: Calendar,
      title: "Easy Event Creation",
      description:
        "Create and manage events with our intuitive step-by-step wizard",
    },
    {
      icon: Users,
      title: "Student Community",
      description:
        "Connect with thousands of students and discover campus events",
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Track attendance, engagement, and event success metrics",
    },
    {
      icon: Shield,
      title: "Admin Approval",
      description:
        "Secure event approval process ensuring quality campus activities",
    },
  ];

  const upcomingEvents = [
    {
      id: "1",
      title: "Annual Tech Symposium 2025",
      date: "December 15, 2025",
      category: "Academic",
      attendees: 145,
      image:
        "https://images.unsplash.com/photo-1760420940953-3958ad9f6287?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwY29uZmVyZW5jZSUyMHdvcmtzaG9wfGVufDF8fHx8MTc2MzE3NTM1NHww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "2",
      title: "Welcome Week Social Mixer",
      date: "November 20, 2025",
      category: "Social",
      attendees: 87,
      image:
        "https://images.unsplash.com/photo-1632834380561-d1e05839a33a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzYzMDcyMjI5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: "3",
      title: "Basketball Tournament",
      date: "November 25, 2025",
      category: "Sports",
      attendees: 96,
      image:
        "https://images.unsplash.com/photo-1762709753300-342ab94e8b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwc3BvcnRzJTIwZXZlbnR8ZW58MXx8fHwxNzYzMTc1MzU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <img
          src={umdCampusImage}
          alt="University of Maryland Campus Building"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Star className="w-3 h-3 mr-1" />
                Trusted by 50,000+ Students
              </Badge>
              <div className="mb-8 p-8 bg-white/10 dark:bg-black/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl">
                <h1 className="mb-6 text-white font-bold">
                  Discover & Create Amazing Campus Events
                </h1>
                <p className="text-xl text-white/90 font-bold">
                  Join the University of Maryland's premier event management
                  platform. Create events, connect with students, and make
                  campus life unforgettable.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <>
                    <Link to="/events">
                      <Button
                        size="lg"
                        className="bg-white text-[#E21833] hover:bg-gray-100"
                      >
                        Browse Events
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Link to="/create-event">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white text-white hover:bg-white/10"
                      >
                        Create Event
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button
                        size="lg"
                        className="bg-white text-[#E21833] hover:bg-gray-100"
                      >
                        Sign In
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white text-white hover:bg-white/10"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card border-y py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-[#E21833] mb-2">5,000+</div>
              <div className="text-muted-foreground">Events Hosted</div>
            </div>
            <div>
              <div className="text-[#E21833] mb-2">50,000+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-[#E21833] mb-2">200+</div>
              <div className="text-muted-foreground">Student Organizations</div>
            </div>
            <div>
              <div className="text-[#E21833] mb-2">98%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-[#E21833]">Why Choose Our Platform</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, manage, and grow your campus events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[#E21833]/10 dark:bg-[#C11528]/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#E21833] dark:text-[#E21833]" />
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="mb-2 text-[#E21833]">Upcoming Events</h2>
              <p className="text-muted-foreground">
                Don't miss out on these exciting campus activities
              </p>
            </div>
            <Link to="/events">
              <Button variant="outline">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white border-0">
                      {event.category}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="mb-2 group-hover:text-[#E21833] transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.attendees} going
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#E21833] dark:bg-[#C11528] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6 text-white">Ready to Create Your Next Event?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join hundreds of student organizations making campus life better,
            one event at a time.
          </p>
          <Link to={isAuthenticated ? "/create-event" : "/login"}>
            <Button
              size="lg"
              className="bg-white text-[#E21833] hover:bg-gray-100"
            >
              {isAuthenticated ? "Get Started Now" : "Sign In to Get Started"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
