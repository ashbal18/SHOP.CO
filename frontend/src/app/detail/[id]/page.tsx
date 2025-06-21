import ProductDetail from "@/components/detailpage/detailpage";
import Footer from "@/components/navbar/navbar/footer";
import Navbar from "@/components/navbar/navbar/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <ProductDetail/>
      <Footer/>
    </div>
  );
} 