"use client";
import React, { useState } from 'react';

const Filter = () => {
  const [selectedColor, setSelectedColor] = useState<string>('green');
  const [selectedSize, setSelectedSize] = useState<string>('Large');

  return (
    <div className="space-y-6 p-4 border-r border-gray-200 w-80">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Filters</h3>
        <button className="text-gray-400 hover:text-gray-600 focus:outline-none">✕</button>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="font-medium text-md">Price</h4>
        <input type="range" min="50" max="200" step="10" className="w-full mt-2" />
        <div className="flex justify-between text-sm">
          <span>$50</span>
          <span>$200</span>
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h4 className="font-medium text-md">Colors</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {['green', 'red', 'yellow', 'blue', 'pink', 'purple', 'orange', 'black', 'white'].map((color) => (
            <div
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300 ${
                selectedColor === color ? 'ring-2 ring-offset-2 ring-black' : ''
              }`}
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h4 className="font-medium text-md">Size</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'].map((size) => (
            <div
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-4 py-2 rounded-lg cursor-pointer text-sm ${
                selectedSize === size ? 'bg-black text-white' : 'bg-gray-100'
              }`}
            >
              {size}
            </div>
          ))}
        </div>
      </div>

      {/* Dress Style Filter */}
      <div>
        <h4 className="font-medium text-md">Dress Style</h4>
        <div className="space-y-2">
          {['Casual', 'Formal', 'Party', 'Gym'].map((style) => (
            <div key={style} className="flex items-center">
              <input type="checkbox" id={style} />
              <label htmlFor={style} className="ml-2">{style}</label>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full bg-black text-white py-2 mt-4 rounded-lg">
        Apply Filter
      </button>
    </div>
  );
};

export default Filter;
