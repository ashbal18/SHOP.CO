import Brands from "@/components/landingpage/brands";
import BrowseByDressStyle from "@/components/landingpage/BrowseByDressStyle";
import Footer from "@/components/navbar/navbar/footer";
import Navbar from "@/components/navbar/navbar/Navbar";
import Banner from "@/components/landingpage/Banner";
import TopSellingSection from "@/components/landingpage/NewArrivals";
import StoreList from "@/components/landingpage/storelist";
import NearestProductsPage from "@/components/landingpage/Neareststoreproduct";


export default function Home() {
  return (
    <div>
    <Navbar />
    <Banner />
    <Brands />
    <NearestProductsPage/>
    <TopSellingSection/>
    <StoreList/>
    <BrowseByDressStyle/>
    <Footer />
    
    
    </div>
  )
}