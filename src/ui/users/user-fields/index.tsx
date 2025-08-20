import { withForm } from '@/contexts/form-create'
import { userFieldsOpts } from './options'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '@/lib/services/settings'

export const UserFields = withForm({
  ...userFieldsOpts,
  render: ({ form }) => {
    const queryClient = useQueryClient()

    const roles = queryClient.getQueryData<GeneralResponse<Role[]>>(['roles'])
    const companies = queryClient.getQueryData<GeneralResponse<Company[]>>([
      'companies',
    ])

    const { data: rolesData = [] } = useQuery({
      queryKey: ['roles'],
      queryFn: () => settingsService.getAllRoles(),
      initialData: roles,
      enabled: !roles,
      select: (data) => data?.payload,
    })

    const { data: companiesData = [] } = useQuery({
      queryKey: ['companies'],
      queryFn: () => settingsService.getAllCompanies(),
      initialData: companies,
      enabled: !companies,
      select: (data) => data?.payload,
    })

    return (
      <>
        <div className='flex flex-col sm:flex-row gap-4 justify-between'>
          <form.AppField
            name='name'
            children={(field) => (
              <field.TextField
                label='Nombre'
                placeholder='Nombre del usuario'
              />
            )}
          />
          <form.AppField
            name='lastname'
            children={(field) => (
              <field.TextField
                label='Apellido'
                placeholder='Apellido del usuario'
              />
            )}
          />
        </div>

        <form.AppField
          name='email'
          children={(field) => (
            <field.TextField
              label='Email'
              type='email'
              placeholder='Email del usuario'
            />
          )}
        />

        <form.AppField
          name='phone'
          children={(field) => (
            <field.TextField
              label='Teléfono'
              type='tel'
              placeholder='Teléfono del usuario'
            />
          )}
        />

        <form.AppField
          name='role'
          children={(field) => (
            <field.SelectField
              label='Rol'
              placeholder='Selecciona un rol'
              options={rolesData.map((role) => ({
                label: role.name,
                value: role.id,
              }))}
            />
          )}
        />

        <form.AppField
          name='company'
          children={(field) => (
            <field.SelectField
              label='Empresa'
              placeholder='Selecciona una empresa'
              options={companiesData.map((company) => ({
                label: company.name,
                value: company.id,
              }))}
            />
          )}
        />
      </>
    )
  },
})
