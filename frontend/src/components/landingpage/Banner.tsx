import Image from "next/image";

export default function Banner() {
  return (
    <section className="w-full flex flex-col justify-center px-6 py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Column - Text */}
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight text-gray-900 max-w-md">
            FIND CLOTHES <br />
            THAT MATCHES <br />
            YOUR STYLE
          </h1>
          <p className="mt-6 text-gray-600 max-w-sm text-base font-normal leading-relaxed">
            Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
          </p>
            <a
            href="/category"
            className="mt-8 inline-block px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-300"
            >
            Shop Now
            </a>
        </div>

        {/* Right Column - Image */}
        <div className="relative">
          <Image
            src="/Banner.png"
            alt="Banner Image"
            layout="intrinsic"
            width={600}
            height={800}
            className=" w-1440 h-663"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 flex justify-center space-x-6">
        <div className="text-center text-gray-600">
          <p>200+ International Brands</p>
        </div>
        <div className="text-center text-gray-600">
          <p>2,000+ High-Quality Products</p>
        </div>
        <div className="text-center text-gray-600">
          <p>30,000+ Happy Customers</p>
        </div>
      </div>
    </section>
  );
}
