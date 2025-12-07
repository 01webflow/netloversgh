import { Users, MessageCircle, ExternalLink, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Community = () => {
  const socialLinks = [
    {
      name: "WhatsApp Group",
      description: "Join our WhatsApp community for instant updates and support",
      icon: MessageCircle,
      url: "#",
      color: "bg-green-500",
      members: "2.5K+ members",
    },
    {
      name: "Telegram Channel",
      description: "Get exclusive deals and announcements on Telegram",
      icon: Share2,
      url: "#",
      color: "bg-blue-500",
      members: "1.8K+ subscribers",
    },
    {
      name: "Facebook Group",
      description: "Connect with other users and share experiences",
      icon: Users,
      url: "#",
      color: "bg-blue-600",
      members: "5K+ members",
    },
  ];

  const testimonials = [
    {
      name: "Kofi Mensah",
      location: "Accra",
      text: "NetLoversGH has been my go-to for data bundles. Fast, reliable, and affordable!",
      rating: 5,
    },
    {
      name: "Ama Serwaa",
      location: "Kumasi",
      text: "Excellent service! The delivery is instant and the prices are unbeatable.",
      rating: 5,
    },
    {
      name: "Prince Binneh",
      location: "Takoradi",
      text: "I've been using NetLoversGH for 6 months now. Never had any issues. Highly recommended!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Our Community
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Be part of our growing family. Connect with thousands of users, get exclusive deals, and stay updated.
          </p>
        </div>
      </section>

      <main className="flex-1 py-12 bg-secondary">
        <div className="container mx-auto px-4">
          {/* Social Links */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Connect With Us
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {socialLinks.map((link) => (
                <div
                  key={link.name}
                  className="bg-background rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`${link.color} w-14 h-14 rounded-full flex items-center justify-center mb-4`}>
                    <link.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {link.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {link.description}
                  </p>
                  <p className="text-primary text-sm font-medium mb-4">
                    {link.members}
                  </p>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">
                      Join Now
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              What Our Users Say
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-background rounded-lg shadow-md p-6"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Heart key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-background rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join thousands of satisfied customers and start saving on your data bundles today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg">
                Create Account
              </Button>
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
