import { settingsSchemas } from '@/lib/schemas/settings'
import { settingsService } from '@/lib/services/settings'
import { PermissionsTable } from '@/ui/roles/permissions-table'
import { Badge } from '@/ui/shared/badge'
import { Button } from '@/ui/shared/button'
import { rolesTranslate } from '@/utils/roles-translate'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { useEffect, useMemo } from 'react'

export const Route = createFileRoute('/_dashboard/settings/roles/$roleId/')({
  component: Permissions,
  validateSearch: zodValidator(settingsSchemas.searchRoles),
})

function Permissions() {
  const { roleId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data: roleData } = useQuery({
    queryKey: ['role-id', roleId],
    queryFn: async () => settingsService.getRoleById(roleId),
    select: (data) => data.payload,
  })

  const { data: permissionsData = [], isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => await settingsService.getAllPermissions(),
    select: (data) => data.payload ?? [],
  })

  const modules = useMemo(() => {
    const modulesMap = new Map()

    permissionsData?.forEach((permission) => {
      if (!modulesMap.has(permission.module)) {
        modulesMap.set(permission.module, {
          label: rolesTranslate[permission.module],
          value: permission.module,
        })
      }
    })

    return [...modulesMap.values()]
  }, [permissionsData]) as { label: string; value: string }[]

  useEffect(() => {
    if (!search.module) {
      navigate({
        search: {
          ...search,
          module: modules[0].value,
        },
      })
    }
  }, [modules])

  const filteredData = useMemo(() => {
    return permissionsData.filter(
      (permission) => permission.module === search.module
    )
  }, [permissionsData, search])

  function changeCurrentModule(module: string) {
    navigate({ search: { ...search, module } })
  }

  return (
    <div>
      <h1 className='text-xl lg:text-2xl font-medium mb-2'>
        Asignar permisos al rol:{' '}
        <span className='capitalize font-semibold'>{roleData?.role.name}</span>
      </h1>
      <div className='space-x-2 mb-2'>
        <span className='font-medium'>Descripción:</span>
        <span className='capitalize font-semibold'>
          {roleData?.role.description}
        </span>
      </div>
      <div className='space-x-2 mb-6'>
        <span className='font-medium'>Estado:</span>
        <Badge>Activo</Badge>
      </div>

      <h2 className='text-lg lg:text-xl font-medium mb-2'>Módulos</h2>
      <div className='mb-6 flex items-center flex-wrap gap-2'>
        {modules.map((module) => (
          <Button
            key={`module-${module.label}`}
            variant={search.module === module.value ? 'secondary' : 'default'}
            onClick={() => changeCurrentModule(module.value)}>
            {module.label}
          </Button>
        ))}
      </div>

      <h3 className='text-base lg:text-lg font-medium'>Permisos del módulo</h3>
      <PermissionsTable data={filteredData} isLoading={isLoading} />
    </div>
  )
}
