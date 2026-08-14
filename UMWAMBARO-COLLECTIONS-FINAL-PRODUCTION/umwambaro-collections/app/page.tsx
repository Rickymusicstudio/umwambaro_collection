import Hero from "@/components/home/Hero";
import ShopByCategory from "@/components/home/ShopByCategory";
import NewArrivals from "@/components/home/NewArrivals";
import TrendingProducts from "@/components/home/TrendingProducts";
import BestSellers from "@/components/home/BestSellers";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Newsletter from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <NewArrivals />
      <TrendingProducts />
      <BestSellers />
      <WhyChooseUs />
      <Newsletter />
    </>
  );
}
