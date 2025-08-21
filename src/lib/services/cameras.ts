import { fetcher } from '@/utils/fetch-api'

class CamerasService {
  async getPreviewCameras() {
    return await fetcher<GeneralResponse<PreviewCamera[]>>(
      '/cameras/get-all-camera-preview'
    )
  }

  async getCameras() {
    return await fetcher<GeneralResponse<Camera[]>>('/cameras/get-all')
  }
}

export const camerasService = new CamerasService()
