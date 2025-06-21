// // components/ProductCard.tsx
// import React from 'react';

// type Product = {
//   name: string;
//   price: number;
//   discount?: number;
//   rating: number;
//   imgSrc: string;
// };

// const ProductCard: React.FC<Product> = ({ name, price, discount, rating, imgSrc }) => {
//   const discountedPrice = discount ? price - (price * (discount / 100)) : price;

//   return (
//     <div className="border rounded-lg shadow-md p-4 space-y-4">
//       <img src={imgSrc} alt={name} className="w-full h-64 object-cover rounded-lg" />
//       <div className="space-y-2">
//         <h3 className="text-lg font-semibold">{name}</h3>
//         <div className="flex items-center space-x-2">
//           <span className="text-sm text-gray-600">Rating: {rating} ★</span>
//         </div>
//         <div className="flex items-center justify-between">
//           <span className="text-lg font-bold">${discountedPrice}</span>
//           {discount && <span className="text-sm line-through text-gray-500">${price}</span>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;
