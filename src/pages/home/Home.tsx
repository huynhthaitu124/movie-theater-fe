import React from 'react';
import Layout from '../../components/layout/Layout';
import Hero from './Hero';
import NowShowing from './NowShowing';
import ComingSoon from './ComingSoon';
import Promotions from './Promotions';
import Features from './Features';

const Home: React.FC = () => {
  return (
    <Layout>
      <Hero />
      <NowShowing />
      <ComingSoon />
      <Features />
      <Promotions />
    </Layout>
  );
};

export default Home;