// pages/index.tsx
import Footer from '@/components/navbar/navbar/footer';
import Navbar from '@/components/navbar/navbar/Navbar';
import React from 'react';
import Newarrivals from './newarrivals';


const Home = () => {
  return (
    <div>
        <Navbar />
              < Newarrivals/>
          <Footer />
          </div>
  );
};
export default Home;
