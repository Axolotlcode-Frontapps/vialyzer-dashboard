import { Circle } from 'lucide-react'

export function MapLegend() {
  return (
    <ul className='absolute bottom-3 left-3 @sm/map:bottom-6 @sm/map:left-6 bg-card/95 rounded-xl shadow p-5 text-base flex flex-col gap-3 border'>
      <li className='flex items-center gap-3'>
        <Circle className='w-4 h-4 text-blue-500' fill='currentColor' />
        Cámaras de monitoreo
      </li>
      <li className='flex items-center gap-3'>
        <Circle className='w-4 h-4 text-red-500' fill='currentColor' />
        Accidentes reportados
      </li>
      <li className='flex items-center gap-3'>
        <Circle className='w-4 h-4 text-yellow-500' fill='currentColor' />
        Obras en la vía
      </li>
    </ul>
  )
}
