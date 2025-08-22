import { useQuery } from '@tanstack/react-query'
import { homeService } from '@/lib/services/home'
import { Skeleton } from '@/ui/shared/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/shared/tooltip'

import Calle9 from '@/assets/images/home/calle-9.png'
import Carrera56 from '@/assets/images/home/carrera-56.png'
import Clinica from '@/assets/images/home/clinica.png'
import Roosevelt from '@/assets/images/home/roosevelt.png'
import ImgPlaceholder from '@/assets/images/shared/img-placeholder.svg'

export function CamerasPreview() {
  const {
    data: previewCamerasData,
    isLoading: isLoadingPreviews,
    isError: isErrorPreviews,
  } = useQuery({
    queryKey: ['get-preview-cameras'],
    queryFn: async () => await homeService.getPreviewCameras(),
    select: (data) => data.payload || [],
  })

  if (isErrorPreviews) {
    return (
      <div className='w-full h-40 grid place-content-center'>
        <span className='text-muted-foreground text-lg font-semibold mb-2'>
          No hay previews de cámaras disponibles
        </span>
      </div>
    )
  }

  if (isLoadingPreviews) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-4'>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className='w-full h-60 rounded-lg' />
        ))}
      </div>
    )
  }

  if (!isLoadingPreviews && !previewCamerasData?.length) {
    return (
      <div className='w-full h-40 grid place-content-center'>
        <span className='text-muted-foreground text-lg font-semibold mb-2'>
          No se encontraron previews de cámaras
        </span>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-4'>
      {previewCamerasData?.map((previewCamera) => (
        <Tooltip key={previewCamera.id}>
          <TooltipTrigger asChild>
            <a
              className='cursor-pointer bg-card rounded-lg shadow hover:shadow-lg transition overflow-hidden h-60 relative'
              href={previewCamera.url}
              target='_blank'
              rel='noreferrer'>
              <img
                src={
                  previewCamera.name === 'Clinica Remedios'
                    ? Clinica
                    : previewCamera.name === 'CLL9_CRA50'
                      ? Calle9
                      : previewCamera.name === 'Camera CARRERA 56'
                        ? Carrera56
                        : previewCamera.name === 'Roosevelt'
                          ? Roosevelt
                          : ImgPlaceholder
                }
                alt='Preview'
                className='w-full h-full object-cover absolute inset-0'
              />
              <div className='absolute bottom-0 left-0 right-0 bg-black/50 p-4'>
                <span className='text-lg font-semibold line-clamp-1 text-white'>
                  {previewCamera.name}
                </span>
              </div>
            </a>
          </TooltipTrigger>
          <TooltipContent className='text-base'>
            Ver preview de cámara
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
