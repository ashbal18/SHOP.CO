// pages/index.tsx
import Filter from '@/components/categorypage.tsx/filter';
import ProductList from '@/components/categorypage.tsx/productlist';
import Footer from '@/components/navbar/navbar/footer';
import Navbar from '@/components/navbar/navbar/Navbar';
import React from 'react';


const Home = () => {
  return (
    <div>
        <Navbar />
        
              < ProductList/>
      
          <Footer />
          </div>
  );
};

export default Home;
