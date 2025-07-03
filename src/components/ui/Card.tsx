import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm border border-secondary-200 ${className}`}
      whileHover={
        hover
          ? {
              y: -2,
              boxShadow: '0 10px 25px -3px rgba(8, 4, 4, 0.1)',
            }
          : {}
      }
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;