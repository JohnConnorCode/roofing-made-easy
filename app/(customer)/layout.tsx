import CustomerLayoutClient from './customer-layout-client'

export const metadata = {
  title: 'Customer Portal | Roofing Made Easy',
  description: 'Access your estimates, financing options, insurance assistance, and assistance programs.',
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CustomerLayoutClient>{children}</CustomerLayoutClient>
}
