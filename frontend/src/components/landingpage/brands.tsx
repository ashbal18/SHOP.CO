import React from 'react';

const Brands: React.FC = () => {
  return (
    <section className="bg-black py-2">
      {/* Brands Section */}
      <div className="mt-4 text-white flex justify-center space-x-8">
        <p className="font-bold ">VERSACE</p>
        <p className="font-bold ">ZARA</p>
        <p className="font-bold ">GUCCI</p>
        <p className="font-bold ">PRADA</p>
        <p className="font-bold ">Calvin Klein</p>
      </div>
    </section>
  );
};

export default Brands;
