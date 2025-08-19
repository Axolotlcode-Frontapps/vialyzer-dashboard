import { UserDelete } from '../user-delete'
import { UserUpdate } from '../user-update'

export function UserTableActions({ user }: { user: User }) {
  return (
    <div className='flex items-center justify-end gap-2'>
      <UserUpdate user={user} />
      <UserDelete user={user} />
    </div>
  )
}
