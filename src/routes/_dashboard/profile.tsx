import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/profile')({
  component: Profile,
})

function Profile() {
  return (
    <div className='w-full max-w-7xl mx-auto'>
      <h1 className='text-2xl font-bold'>Profile Page</h1>
      <p>This is the profile page content.</p>
    </div>
  )
}
