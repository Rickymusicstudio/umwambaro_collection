import Container from "./Container";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#ead9c0] bg-[#2a211f] text-white">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-3">
          <div>
            <p className="text-xl font-semibold tracking-[0.18em]">UMWAMBARO</p>
            <p className="mt-2 text-[10px] font-semibold tracking-[0.45em] text-[#e7bd63]">COLLECTIONS</p>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">
              Crafted in Rwanda. Worn Around the World. Discover new pieces and carefully selected Chaguwa finds.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Shop</h3>
            <div className="mt-4 space-y-2 text-sm text-white/70">
              <Link className="block hover:text-[#e7bd63]" href="/shop">All products</Link>
              <Link className="block hover:text-[#e7bd63]" href="/shop?condition=new">New</Link>
              <Link className="block hover:text-[#e7bd63]" href="/shop?condition=chaguwa">Chaguwa</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Need help?</h3>
            <p className="mt-4 text-sm leading-6 text-white/70">Contact us for sizing, availability, delivery and product condition details.
            </p>
            <Link className="mt-4 inline-flex rounded-full bg-[#c9a14a] px-5 py-2.5 text-sm font-semibold text-[#2a211f] hover:bg-[#e7bd63]" href="/contact">Contact us</Link>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-xs text-white/50">© {new Date().getFullYear()} Umwambaro Collections. All rights reserved.</div>
      </Container>
    </footer>
  );
}
