
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const TeamSection = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      position: "Founder & CEO",
      description: "With 10+ years in fashion retail, Sarah leads Urban's vision of making style accessible to everyone.",
      initials: "SJ",
      image: null
    },
    {
      name: "Michael Chen",
      position: "Head of Design",
      description: "Michael brings creative excellence to every collection, ensuring our products reflect the latest trends.",
      initials: "MC",
      image: null
    },
    {
      name: "Emma Rodriguez",
      position: "Operations Manager",
      description: "Emma ensures smooth operations from sourcing to delivery, maintaining our quality standards.",
      initials: "ER",
      image: null
    },
    {
      name: "David Kim",
      position: "Customer Experience Lead",
      description: "David focuses on creating exceptional customer experiences and building lasting relationships.",
      initials: "DK",
      image: null
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet Our <span className="text-primary">Team</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The passionate individuals behind Urban who work tirelessly to bring you the best fashion experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <Card 
              key={index} 
              className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in border-border"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-foreground mb-2">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.position}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{member.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
