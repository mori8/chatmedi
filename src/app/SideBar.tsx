'use client';

import React from 'react'
import { usePathname } from 'next/navigation'

import ChatSideBar from './components/ChatSideBar'
import AccountSideBar from './account/AccountSideBar'

type Props = {}

export default function SideBar({ }: Props) {
  const pathname = usePathname()
  const isAccount = pathname.startsWith('/account')

  return (
    <div>
      {isAccount ? <AccountSideBar /> : <ChatSideBar />}
    </div>
  )
}