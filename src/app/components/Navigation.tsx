import React from 'react'
import Link from 'next/link'

type Props = {}

export default function Navigation({ }: Props) {
  const tabList = [
    {
      name: 'PLAYGROUND',
      path: '/'
    },
    {
      name: 'DOCUMENTS',
      path: '/documents'
    }
  ]
  return (
    <div className='fixed z-10 w-full pt-6 px-12'>
      <ul className='flex flex-row gap-10'>
        {
          tabList.map((tab, index) => (
            <li key={index} className='rounded-full hover:bg-white px-4 py-1'>
              <Link href={tab.path}>
                <span className='font-mono'>{tab.name}</span>
              </Link>
            </li>
          ))
        }
      </ul>
    </div>
  )
}