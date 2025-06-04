import React, { useState } from 'react';
import { Clock, Tag, Info } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { mockPromotions } from '../../data/mockPromotions';

interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'active' | 'upcoming' | 'expired';
  endDate: string;
  code: string;
  terms: string[];
}

const PromotionCard: React.FC<{ promo: Promotion }> = ({ promo }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-secondary-800 rounded-lg overflow-hidden shadow-lg">
      <div className="aspect-video relative">
        <img 
          src={imageError ? '/images/placeholder.jpg' : promo.imageUrl} 
          alt={promo.title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute top-4 right-4">
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${promo.status === 'active' ? 'bg-success-500 text-white' :
              promo.status === 'upcoming' ? 'bg-primary-500 text-white' :
              'bg-secondary-600 text-secondary-300'}
          `}>
            {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{promo.title}</h3>
        <p className="text-secondary-300 mb-4">{promo.description}</p>

        <div className="space-y-4">
          <div className="flex items-center text-secondary-300">
            <Clock size={20} className="mr-2" />
            <span>Valid until {new Date(promo.endDate).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center text-secondary-300">
            <Tag size={20} className="mr-2" />
            <span>Use code: <span className="font-mono text-primary-500">{promo.code}</span></span>
          </div>

          <div className="mt-4">
            <div className="flex items-start">
              <Info size={20} className="mr-2 mt-1 text-secondary-400" />
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Terms & Conditions:</h4>
                <ul className="list-disc list-inside text-sm text-secondary-300 space-y-1">
                  {promo.terms.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Promotions: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Special Offers & Promotions</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockPromotions.map((promo) => (
            <PromotionCard key={promo.id} promo={promo} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Promotions;