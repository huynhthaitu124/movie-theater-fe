import React, { useState, useEffect } from 'react';
import { Clock, Tag, Info } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { promotionService } from '../../services/modules/promotion.Service'; // <-- import service

interface Promotion {
  promotionId: string;
  title: string;
  detail: string;
  image: string;
  status: string;
  endTime: string;
  code: string;
  // Add other fields as needed
}

const PromotionCard: React.FC<{ promo: Promotion }> = ({ promo }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-secondary-800 rounded-lg overflow-hidden shadow-lg">
      <div className="aspect-video relative">
        <img
          src={imageError ? '/images/placeholder.jpg' : promo.image}
          alt={promo.title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute top-4 right-4">
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${promo.status === 'ACTIVE' ? 'bg-success-500 text-white' :
              promo.status === 'UPCOMING' ? 'bg-primary-500 text-white' :
              'bg-secondary-600 text-secondary-300'}
          `}>
            {promo.status.charAt(0).toUpperCase() + promo.status.slice(1).toLowerCase()}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{promo.title}</h3>
        <p className="text-secondary-300 mb-4">{promo.detail}</p>

        <div className="space-y-4">
          <div className="flex items-center text-secondary-300">
            <Clock size={20} className="mr-2" />
            <span>Valid until {new Date(promo.endtime).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center text-secondary-300">
            <Tag size={20} className="mr-2" />
            <span>Use code: <span className="font-mono text-primary-500">{promo.code}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Promotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    promotionService.getAll().then(res => {
      setPromotions(res.data || []);
    });
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Special Offers & Promotions</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <PromotionCard key={promo.promotionId} promo={promo} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Promotions;