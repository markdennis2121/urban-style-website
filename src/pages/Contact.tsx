
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting contact form:', formData);
      
      // Direct insert without testing connection first
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }])
        .select();

      if (error) {
        console.error('Contact form submission error:', error);
        throw error;
      }

      console.log('Contact message sent successfully:', data);

      toast({
        title: "Message sent!",
        description: "Thank you for your message. We'll get back to you soon.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (error: any) {
      console.error('Contact form error:', error);
      
      toast({
        title: "Error sending message",
        description: error?.message || 'Please try again later.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Have questions about our products or need assistance? We're here to help! 
              Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-card border-border rounded-2xl shadow-lg">
              <CardHeader className="border-b border-border bg-muted rounded-t-2xl">
                <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-foreground">
                  <div className="bg-primary p-3 rounded-xl">
                    <Mail className="h-6 w-6 text-primary-foreground" />
                  </div>
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  Fill out the form below and we'll respond within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="rounded-xl border-input focus:border-primary focus:ring-primary h-12"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="rounded-xl border-input focus:border-primary focus:ring-primary h-12"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium text-foreground mb-2 block">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="rounded-xl border-input focus:border-primary focus:ring-primary h-12"
                      placeholder="What can we help you with?"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-foreground mb-2 block">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="rounded-xl border-input focus:border-primary focus:ring-primary resize-none"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-xl text-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="bg-gradient-to-br from-muted to-muted/50 border-border rounded-2xl shadow-lg">
                <CardHeader className="border-b border-border bg-muted rounded-t-2xl">
                  <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-foreground">
                    <div className="bg-primary p-3 rounded-xl">
                      <MapPin className="h-6 w-6 text-primary-foreground" />
                    </div>
                    Visit Our Store
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary p-2 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Our Address</h3>
                        <p className="text-muted-foreground">
                          Celine Homes<br />
                          Bacolod City<br />
                          Philippines 1000
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary p-2 rounded-lg">
                        <Phone className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                        <p className="text-muted-foreground">+639709804794</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Email</h3>
                        <p className="text-muted-foreground">mmanangan021@gmail.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Store Hours</h3>
                        <p className="text-muted-foreground">
                          Monday - Saturday: 9:00 AM - 8:00 PM<br />
                          Sunday: 10:00 AM - 6:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent to-accent/50 border-border rounded-2xl shadow-lg">
                <CardHeader className="border-b border-border bg-accent rounded-t-2xl">
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Quick Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">
                    Need immediate assistance? We're here to help!
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-primary rounded-full"></span>
                      <span className="text-muted-foreground">Live chat available 24/7</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-primary rounded-full"></span>
                      <span className="text-muted-foreground">Email response within 24 hours</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-primary rounded-full"></span>
                      <span className="text-muted-foreground">Phone support during business hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
