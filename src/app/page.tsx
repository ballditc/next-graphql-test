import React from 'react'
import Link from 'next/link';

const RootPage = () => {
  return (
    <div>
      RootPage
      <div>
        <Link href="/about?id=13">
          Next link button
        </Link>
      </div>
    </div>
  )
}

export default RootPage
