import Image from "next/image"
import Link from "next/link"

interface CollectionCardProps {
  title: string
  image: string
  href: string
}

export default function CollectionCard({
  title,
  image,
  href,
}: CollectionCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-3xl"
    >
      <div className="relative h-[520px] w-full">

        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-10 left-10">

          <h2 className="text-3xl font-bold text-white">
            {title}
          </h2>

          <p className="mt-3 text-[#C9A14A]">
            Explore →
          </p>

        </div>

      </div>
    </Link>
  )
}