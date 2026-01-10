import ProductForm from '@/components/admin/ProductForm'

type Props = { params: { id: string } }

export default function Page({ params }: Props) {
  const { id } = params
  return (
    <Layout title="Edit Product">
      <ProductForm productId={id} />
    </Layout>
  )
}
