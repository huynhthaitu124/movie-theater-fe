import React from 'react';
import { MonitorSmartphone, Music, ThumbsUp, Popcorn, Ticket, CreditCard } from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-secondary-800 rounded-lg shadow-card transition-transform duration-300 hover:-translate-y-1">
      <div className="p-4 bg-primary-50 dark:bg-primary-900/50 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-secondary-900 dark:text-white">{title}</h3>
      <p className="text-secondary-600 dark:text-secondary-400">{description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  const features = [
    {
      icon: <MonitorSmartphone className="h-8 w-8 text-primary-600 dark:text-primary-400" />,
      title: "4K Ultra HD Screens",
      description: "Experience movies in stunning clarity with our state-of-the-art 4K projection systems."
    },
    {
      icon: <Music className="h-8 w-8 text-primary-600 dark:text-primary-400" />,
      title: "Dolby Atmos Sound",
      description: "Immerse yourself in three-dimensional audio that flows all around you."
    },
    {
      icon: <ThumbsUp className="h-8 w-8 text-primary-600 dark:text-primary-400" />,
      title: "Premium Comfort",
      description: "Relax in our spacious, ergonomic seating designed for maximum comfort during any movie."
    },
    {
      icon: <Popcorn className="h-8 w-8 text-primary-600 dark:text-primary-400" />,
      title: "Gourmet Concessions",
      description: "Enjoy premium snacks and beverages available at our concession stands."
    },
    {
      icon: <Ticket className="h-8 w-8 text-primary-600 dark:text-primary-400" />,
      title: "Easy Booking",
      description: "Reserve your seats in advance with our intuitive online booking system."
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary-600 dark:text-primary-400" />,
      title: "Membership Benefits",
      description: "Join our loyalty program for exclusive discounts, promotions, and special events."
    }
  ];

  return (
    <section className="py-16 bg-secondary-100 dark:bg-secondary-800/50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
            Why Choose CinemaPlus
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            We're dedicated to providing the ultimate movie-going experience with premium amenities and services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;