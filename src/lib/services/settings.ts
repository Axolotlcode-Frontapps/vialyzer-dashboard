import { fetcher } from '@/utils/fetch-api'
import type { RoleValues, UserValues } from '../schemas/settings'

class SettingsServices {
  async getAllRoles() {
    return await fetcher<GeneralResponse<Role[]>>('/roles/get-all')
  }

  async createRole(values: RoleValues) {
    return await fetcher<GeneralResponse<Role>>('/roles/create', {
      method: 'POST',
      data: values,
    })
  }

  async updateRole(id: string, values: RoleValues) {
    return await fetcher<GeneralResponse<Role>>(`/roles/update`, {
      method: 'PUT',
      data: { id, ...values },
    })
  }

  async deleteRole(id: string) {
    return await fetcher<GeneralResponse<Role>>(`/roles/delete`, {
      method: 'DELETE',
      data: { id },
    })
  }

  async getAllUsers() {
    return await fetcher<GeneralResponse<User[]>>('/users/get-all')
  }

  async createUser(values: UserValues) {
    return await fetcher<GeneralResponse<User>>('/users/create', {
      method: 'POST',
      data: values,
    })
  }

  async updateUser(id: string, values: UserValues) {
    return await fetcher<GeneralResponse<User>>(`/users/update`, {
      method: 'PUT',
      data: { id, ...values },
    })
  }

  async deleteUser(id: string) {
    return await fetcher<GeneralResponse<User>>(`/users/delete`, {
      method: 'DELETE',
      data: { id },
    })
  }
}

export const settingsService = new SettingsServices()
