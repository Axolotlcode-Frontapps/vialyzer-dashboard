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

interface Company {
  id: string
  name: string
  nit: string
  phone: string
  address: string
  department: string
  city: string
  description: string
  active: string
  users: User[]
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

interface Department {
  departments: string
  cities: string[]
}

interface Departments {
  departments: Department[]
}
