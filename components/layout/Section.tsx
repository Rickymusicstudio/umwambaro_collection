import { ReactNode } from "react"

interface SectionProps {
  children: ReactNode
  className?: string
}

export default function Section({
  children,
  className = "",
}: SectionProps) {
  return (
    <section
      className={`py-20 lg:py-28 ${className}`}
    >
      {children}
    </section>
  )
}