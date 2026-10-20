import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CountyResourcePage from '@/components/rehab-resources/CountyResourcePage'
import { COUNTY_RESOURCE_PAGES, countyResourceDescription, countyResourcePage, countyResourceTitle } from '@/lib/rehab-resources/counties'

export const dynamic = 'force-static'
export const dynamicParams = false
// Re-evaluate expiry dates daily without turning this public directory into a client query.
export const revalidate = 86400

export function generateStaticParams() {
  return COUNTY_RESOURCE_PAGES.map((county) => ({ county: county.slug }))
}

interface PageProps {
  params: Promise<{ county: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const county = countyResourcePage((await params).county)
  if (!county) notFound()
  const title = countyResourceTitle(county)
  const description = countyResourceDescription(county)
  const url = `/rehab-resources/${county.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CountyPage({ params }: PageProps) {
  const county = countyResourcePage((await params).county)
  if (!county) notFound()
  return <CountyResourcePage county={county} />
}
