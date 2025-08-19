import { withForm } from '@/contexts/form-create'
import { userFieldsOpts } from './options'

export const UserFields = withForm({
  ...userFieldsOpts,
  render: ({ form }) => {
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
            name='lastName'
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
            <field.TextField label='Rol' placeholder='Rol del usuario' />
          )}
        />

        <form.AppField
          name='company'
          children={(field) => (
            <field.TextField
              label='Empresa'
              placeholder='Empresa del usuario'
            />
          )}
        />
      </>
    )
  },
})
