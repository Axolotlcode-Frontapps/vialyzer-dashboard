import { fetcher } from '@/utils/fetch-api'
import type { RoleValues } from '../schemas/settings'

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
}

export const settingsService = new SettingsServices()
