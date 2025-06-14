
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('=== CONTACT FORM SUBMISSION DEBUG ===');
      console.log('Form data:', formData);
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set');
      console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
      
      // Validate form data
      if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
        throw new Error('All fields are required');
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        throw new Error('Please enter a valid email address');
      }

      console.log('Attempting to insert into contact_messages table...');
      
      const insertData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      };
      
      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('contact_messages')
        .insert([insertData])
        .select();

      if (error) {
        console.error('=== SUPABASE ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Error code:', error.code);
        console.error('Full error object:', error);
        throw error;
      }

      console.log('=== SUCCESS ===');
      console.log('Message sent successfully! Data:', data);

      toast({
        title: "Message sent successfully!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });
      
    } catch (err: any) {
      console.error('=== SUBMISSION ERROR ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      
      let errorMessage = "Failed to send message. Please try again.";
      
      if (err.message === 'All fields are required') {
        errorMessage = "Please fill in all fields.";
      } else if (err.message === 'Please enter a valid email address') {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === '42501') {
        errorMessage = "Database permission error. Please contact support.";
      } else if (err.code === '42P01') {
        errorMessage = "Database table not found. Please contact support.";
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      toast({
        title: "Error sending message",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="pt-24 pb-8 bg-muted/50 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-muted-foreground">Get in touch with our team</p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-background/80 border-border"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-background/80 border-border"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="bg-background/80 border-border"
                    placeholder="What is this about?"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="bg-background/80 border-border"
                    placeholder="Tell us more about your inquiry..."
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Get in touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Address</h3>
                    <p className="text-muted-foreground">
                      Celine Homes, Bacolod City<br />
                      Building 123, Floor 4<br />
                      City, State 12345
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Phone</h3>
                    <p className="text-muted-foreground">09709804794</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Email</h3>
                    <p className="text-muted-foreground">UrbanPH@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">Business Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Saturday: 10:00 AM - 10:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Map */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4 text-foreground">Find us here</h3>
                <div className="rounded-lg h-[400px] overflow-hidden border border-border">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125559.34760461194!2d122.94144839726556!3d10.676732500000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33aed056a0feacd9%3A0x90bd5c4b10d59e34!2sBacolod%20City%2C%20Negros%20Occidental!5e0!3m2!1sen!2sph!4v1705999728932!5m2!1sen!2sph"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Bacolod City Map"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
