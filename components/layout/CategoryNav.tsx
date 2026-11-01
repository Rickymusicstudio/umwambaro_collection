import Link from "next/link";
import Container from "./Container";

const categories = [
  "Women",
  "Men",
  "Kids",
  "Shoes",
  "Bags",
  "Accessories",
  "Sale",
];

export default function CategoryNav() {
  return (
    <nav className="border-b bg-white">

      <Container>

        <ul className="flex h-14 items-center justify-center gap-10 overflow-auto">

          <li>
            <Link
              href="/"
              className="font-semibold hover:text-[#c8a27a]"
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              href="/shop"
              className="font-semibold hover:text-[#c8a27a]"
            >
              Shop
            </Link>
          </li>

          {categories.map((category) => (

            <li key={category}>

              <Link
                href={`/shop?category=${category}`}
                className="hover:text-[#c8a27a]"
              >
                {category}
              </Link>

            </li>

          ))}

        </ul>

      </Container>

    </nav>
  );
}