import { withForm } from '@/contexts/form-create'
import { companyFieldsOpts } from './options'

export const CompanyFields = withForm({
  ...companyFieldsOpts,
  render: ({ form }) => {
    return (
      <>
        <form.AppField
          name='name'
          children={(field) => (
            <field.TextField
              label='Nombre'
              placeholder='Nombre de la empresa'
            />
          )}
        />
        <form.AppField
          name='description'
          children={(field) => (
            <field.TextField
              label='Descripción'
              placeholder='Descripción de la empresa'
            />
          )}
        />
        <div className='flex flex-col sm:flex-row gap-4'>
          <form.AppField
            name='nit'
            children={(field) => (
              <field.TextField label='NIT' placeholder='NIT de la empresa' />
            )}
          />
          <form.AppField
            name='phone'
            children={(field) => (
              <field.TextField
                label='Teléfono'
                placeholder='Teléfono de la empresa'
              />
            )}
          />
        </div>
        <form.AppField
          name='address'
          children={(field) => (
            <field.TextField
              label='Dirección'
              placeholder='Dirección de la empresa'
            />
          )}
        />
        <form.AppField
          name='department'
          children={(field) => (
            <field.TextField
              label='Departamento'
              placeholder='Departamento de la empresa'
            />
          )}
        />
        <form.AppField
          name='city'
          children={(field) => (
            <field.TextField
              label='Ciudad'
              placeholder='Ciudad de la empresa'
            />
          )}
        />
      </>
    )
  },
})
