import ProductForm from '@/components/admin/ProductForm'
import Layout from '@/components/Layout'

type Props = { params: { id: string } }

export default function Page({ params }: Props) {
  const { id } = params
  return (
    <Layout title="Edit Product">
      <ProductForm productId={id} />
    </Layout>
  )
}
