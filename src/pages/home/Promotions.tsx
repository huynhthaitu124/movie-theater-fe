import React from 'react';
import { Calendar, Tag, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { promotions } from '../../data/mockData';

const Promotions: React.FC = () => {
  return (
    <section className="py-16 bg-secondary-50 dark:bg-secondary-900">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
            Special Offers
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Take advantage of these limited-time promotions for your next cinema experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="card p-6 hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-md">
                  <Tag className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="px-3 py-1 rounded-full bg-success-500 text-white text-xs font-medium">
                  Active
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                {promotion.code}
              </h3>
              
              <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                {promotion.description}
              </p>
              
              <div className="flex items-center text-secondary-500 dark:text-secondary-400 mb-2">
                <Calendar size={16} className="mr-1" />
                <span>Valid until {new Date(promotion.endDate).toLocaleDateString()}</span>
              </div>
              
              {promotion.minPurchase && (
                <div className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">
                  Minimum purchase: ${promotion.minPurchase.toFixed(2)}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                <Link 
                  to="/promotions" 
                  className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  <span>View Details</span>
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Promotions;