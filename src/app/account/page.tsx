import { redirect } from 'next/navigation'

type Props = {}

export default function Home({ }: Props) {
  redirect('/account/api-key')

  return (
    <div className="flex">

    </div>
  )
}