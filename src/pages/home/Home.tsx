import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Hero from './Hero';
import NowShowing from './NowShowing';
import ComingSoon from './ComingSoon';
import Promotions from './Promotions';
import Features from './Features';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ScrollToTop from '../../components/common/ScrollToTop';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Hero />
        
        <motion.section
          initial={{ y: 50 }}
          whileInView={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-padding"
        >
          <NowShowing />
        </motion.section>

        <motion.section
          initial={{ y: 50 }}
          whileInView={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-padding"
        >
          <ComingSoon />
        </motion.section>

        <motion.section
          initial={{ y: 50 }}
          whileInView={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-padding"
        >
          <Features />
        </motion.section>

        <motion.section
          initial={{ y: 50 }}
          whileInView={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-padding"
        >
          <Promotions />
        </motion.section>
      </motion.div>
      
      <ScrollToTop />
    </Layout>
  );
};

export default Home;