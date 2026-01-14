'use client'

import { SubcategoryList } from '@/components/SubcategoryList'
import { useParams } from 'next/navigation'

export default function CategoryPage() {
  const params = useParams()
  const categoryKey = params.category as string
  
  return <SubcategoryList categoryKey={categoryKey} />
}
