import React from "react";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    comment: "I’m blown away by the quality and style of the herbal skincare from Salvoil.",
  },
  {
    id: 2,
    name: "Sarah M.",
    rating: 5,
    comment: "I’m blown away by the quality and style of the herbal skincare from Salvoil.",
  },
  {
    id: 3,
    name: "Sarah M.",
    rating: 5,
    comment: "I’m blown away by the quality and style of the herbal skincare from Salvoil.",
  },
  {
    id: 4,
    name: "Sarah M.",
    rating: 5,
    comment: "I’m blown away by the quality and style of the herbal skincare from Salvoil.",
  },  {
    id: 5,
    name: "Sarah M.",
    rating: 5,
    comment: "I’m blown away by the quality and style of the herbal skincare from Salvoil.",
  },  {
    id: 6,
    name: "Sarah M.",
    rating: 5,
    comment: "I’m blown away by the quality and style of the herbal skincare from Salvoil.",
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className=" flex text-yellow-400 space-x-0.5">
    {Array(5).fill(0).map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 fill-current ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.955L10 0l2.948 5.955 6.562.955-4.755 4.635 1.123 6.545z" />
      </svg>
    ))}
  </div>
);

export default function OurHappyCustomers() {
  return (
    <section className="w-full mx-auto px-6 py-10 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">OUR HAPPY CUSTOMERS</h2>
        <div className="flex space-x-3 text-gray-600">
          <button aria-label="Previous" className="p-2 rounded-full hover:bg-gray-100 transition">
            {/* Previous Button */}
          </button>
          <button aria-label="Next" className="p-2 rounded-full hover:bg-gray-100 transition">
            {/* Next Button */}
          </button>
        </div>
      </div>

      <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
        {testimonials.map(({ id, name, rating, comment }) => (
          <div key={id} className="min-w-[320px] bg-gray-50 rounded-lg p-5 shadow flex flex-col justify-between">
            <StarRating rating={rating} />
            <p className="mt-4 text-gray-700 text-sm line-clamp-3">{comment}</p>
            <p className="mt-6 font-semibold text-indigo-700">{name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
