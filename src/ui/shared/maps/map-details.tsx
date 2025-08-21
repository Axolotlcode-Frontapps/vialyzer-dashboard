import { useSelectedLocation } from '@/hooks/use-selected-location'
import { Button } from '../button'
import { X } from 'lucide-react'
import { formatDate } from '@/utils/date-format'
import { STATUS } from '@/utils/statuses'

export function MapDetails() {
  const { selectedLocation: location, onSelect } = useSelectedLocation()

  if (!location) return null

  return (
    <article className='absolute top-0 right-0 @sm/map:top-10 @sm/map:right-10 bg-card rounded-2xl shadow-2xl border-2 border-primary p-8 w-[350px] max-w-full z-50 flex flex-col gap-4 animate-fade-in'>
      <Button
        size='icon'
        className='size-5 absolute top-2 right-2 z-0'
        variant='ghost'
        onClick={() => onSelect()}>
        <X className='size-3.5 text-muted-foreground' />
      </Button>
      <h3 className='flex items-center gap-3 mb-2'>
        <span
          className={`w-4 h-4 rounded-full ${STATUS[location.state].color} inline-block`}
        />
        <span className='font-bold text-xl'>{location.name}</span>
      </h3>
      <section className='flex flex-col gap-2 text-lg'>
        <span>
          Volumen actual:{' '}
          <span className='font-semibold'>
            {/* {location.volume.toLocaleString()} v/h */}
          </span>
        </span>
        <span>
          Última actualización:{' '}
          <span className='font-semibold'>
            {formatDate(location.updatedAt)}
          </span>
        </span>
        <span>
          Estado:{' '}
          <span className={`font-semibold ${STATUS[location.state].dot}`}>
            {STATUS[location.state].label}
          </span>
        </span>
        {/* <span>
          Municipio: <span className="font-semibold">Bogotá</span>
        </span> */}
      </section>
      <Button
        className='mt-4 h-12 rounded-lg font-bold text-lg'

        // onClick={() =>
        //   navigate(
        //     `/mobility?project=${location.project.id}&camera=${location.id}&tab=volume`
        //   )
        // }
      >
        Ver más información
      </Button>
    </article>
  )
}
