interface Role {
  id: string
  name: string
  description: string
  active: boolean
}

interface User {
  id: string
  name: string
  lastName: string
  email: string
  phone: string
  role: Role
  createdAt: Date
  active: boolean
  lastLogin: Date
}
