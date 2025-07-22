import React, { useState, useEffect } from 'react';
import { Calendar, Tag, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import { promotionService } from '../../services/modules/promotion.Service'; 
import { promotionTypeService } from '../../services/modules/promotionType.service';
import 'swiper/css';
import 'swiper/css/navigation';

const Promotions: React.FC = () => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotionTypes, setPromotionTypes] = useState<any[]>([]);

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const [promoRes, typeRes] = await Promise.all([
      promotionService.getAll(),
      promotionTypeService.getAll(),
    ]);
    setPromotions(promoRes.data || []);
    setPromotionTypes(typeRes.data || []);
    setLoading(false);
  };
  fetchData();
}, []);

  return (
    <section className="py-16 bg-secondary-50 dark:bg-secondary-900">
      <div className="container-custom">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
            Special Offers
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Take advantage of these limited-time promotions for your next cinema experience
          </p>
        </motion.div>

        <div className="relative group">
          {loading ? (
            <div className="text-center text-secondary-400 py-12">Loading promotions...</div>
          ) : (
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={32}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              navigation={{
                prevEl: '.swiper-button-prev',
                nextEl: '.swiper-button-next',
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="px-4 py-4"
            >
              {promotions.map((promotion) => {
                const promoType = promotionTypes.find(
                  (type) => type.promotiontypeid === promotion.promotiontypeid
                );
                return (
                  <SwiperSlide key={promotion.promotionid}>
                    <motion.div 
                      className="bg-white dark:bg-secondary-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                    >
                      <div className="relative h-48">
                        <img 
                          src={imageErrors[promotion.image] 
                            ? "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"
                            : promotion.image || promotion.imageUrl
                          } 
                          alt={promotion.title}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImageErrors(prev => ({
                              ...prev,
                              [promotion.promotionId]: true
                            }));
                          }}
                        />
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-xs font-medium
                          ${promotion.status === 'ACTIVE' ? 'bg-success-500' : 
                            promotion.status === 'EXPIRED' ? 'bg-error-500' : 
                            'bg-warning-500'}`}
                        >
                          {promotion.status?.charAt(0).toUpperCase() + promotion.status?.slice(1).toLowerCase()}
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                          {promotion.title}
                        </h3>
                        {promoType && (
                          <div className="text-xs text-primary-500 mb-1">
                            {promoType.name}
                          </div>
                        )}
                        
                        {/* {promotion.discountType && (
                          <div className="text-lg font-semibold text-primary-600 dark:text-primary-400 mb-3">
                            {promotion.discountType === 'percentage' 
                              ? `${promoType.typename}% OFF`
                              : `₫${promotion.discountValue?.toLocaleString()} OFF`
                            }
                          </div>
                        )} */}
                        
                        <p className="text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-2">
                          {promotion.detail || promotion.description}
                        </p>
                        
                        <div className="flex items-center text-secondary-500 dark:text-secondary-400 mb-4">
                          <Calendar size={16} className="mr-1" />
                          <span>
                            Valid until{' '}
                            {promotion.endtime
                              ? new Date(promotion.endtime).toLocaleDateString()
                              : promotion.endDate
                              ? new Date(promotion.endDate).toLocaleDateString()
                              : ''}
                          </span>
                        </div>
                        
                        <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
                          <Link 
                            to="/promotions"
                            className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                          >
                            <span>View Details</span>
                            <ChevronRight size={16} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}

          <button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-6 hover:scale-110">
            <ChevronLeft size={28} />
          </button>
          <button className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-6 hover:scale-110">
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Promotions;