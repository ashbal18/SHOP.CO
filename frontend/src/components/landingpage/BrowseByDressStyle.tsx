import React from "react";

const styles = [
  {
    title: "Casual",
    img: "https://down-id.img.susercontent.com/file/sg-11134201-7rblm-llf9xombwnki92",
  },
  {
    title: "Formal",
    img: "https://assets-a1.kompasiana.com/items/album/2017/10/08/jas-pria-formal-hitam-exclusive-kancing-dua-kerah-lipat-p-140-hitam-7670-08587731-c3fd54a536e1215a3f1641ffa25e4421-zoom-850x850-59da4f8a4b0a68277b0aa393.jpg?t=o&v=1200",
  },
  {
    title: "Party",
    img: "https://down-id.img.susercontent.com/file/2fad4dec3c4371ed253f0f029c335e78",
  },
  {
    title: "Gym",
    img: "https://cdn.idntimes.com/content-images/community/2022/07/20220712-075818-329ae2b286ff7799fbbec7d4597d307a-669aee9aa0148b2778fa99a35d902b9f.jpg",
  },
];

export default function BrowseByDressStyle() {
  return (
    <div className="bg-white py-10 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-800 mb-10">
        CHANGE YOUR STYLE, CHANGE YOUR LIFE
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {styles.map((style, index) => (
          <div
            key={index}
            className="relative rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl group"
          >
            <img
              src={style.img}
              alt={style.title}
              className="w-full h-52 object-cover transition duration-300 group-hover:brightness-75"
            />
            <span className="absolute bottom-3 left-3 bg-white bg-opacity-80 text-gray-900 font-semibold px-3 py-1 rounded text-sm shadow">
              {style.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
