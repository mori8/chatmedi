import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

type Props = {}

export default function ErrorFallback({}: Props) {
  return (
    <div className='bg-rose-50 p-3 rounded-lg border border-red-100 '>
      <div className='flex items-center gap-2'>
        <ExclamationTriangleIcon className='text-rose-500 w-5 h-5' />
        <span className='text-sm text-rose-500'>An error occurred. Please try again later.</span>
      </div>
    </div>
  )
}
