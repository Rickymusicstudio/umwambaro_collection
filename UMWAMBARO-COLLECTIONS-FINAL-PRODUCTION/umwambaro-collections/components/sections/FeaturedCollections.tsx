import Container from "@/components/layout/Container"
import Section from "@/components/layout/Section"
import SectionTitle from "@/components/shared/SectionTitle"
import CollectionCard from "@/components/collection/CollectionCard"

export default function FeaturedCollections() {
  return (
    <Section className="bg-[#FAF8F5]">

      <Container>

        <SectionTitle
          title="Featured Collections"
          subtitle="Discover timeless pieces inspired by African elegance."
        />

        <div className="grid gap-8 md:grid-cols-3">

          <CollectionCard
            title="Women"
            href="/shop/women"
            image="/images/women.jpeg"
          />

          <CollectionCard
            title="Men"
            href="/shop/men"
            image="/images/men.jpeg"
          />

          <CollectionCard
            title="Accessories"
            href="/shop/accessories"
            image="/images/accessories.jpeg"
          />

        </div>

      </Container>

    </Section>
  )
}