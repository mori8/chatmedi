import { redirect } from 'next/navigation'

type Props = {}

export default function page({ }: Props) {
  redirect('/account/api-key')

  return (
    <div className="flex">

    </div>
  )
}