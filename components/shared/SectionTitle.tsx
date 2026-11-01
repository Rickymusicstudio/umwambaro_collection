interface Props {
  title: string
  subtitle?: string
}

export default function SectionTitle({
  title,
  subtitle,
}: Props) {
  return (
    <div className="mb-16 text-center">

      <p className="mb-3 uppercase tracking-[0.45em] text-[#c8a27a]">
        Luxury Fashion
      </p>

      <h2 className="text-5xl font-bold text-zinc-900">
        {title}
      </h2>

      {subtitle && (
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500">
          {subtitle}
        </p>
      )}

    </div>
  )
}