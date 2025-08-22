import { fetcher } from '@/utils/fetch-api'

class HomeService {
  async getPreviewCameras() {
    return await fetcher<GeneralResponse<PreviewCamera[]>>(
      '/cameras/get-all-camera-preview'
    )
  }

  async getCameras() {
    return await fetcher<GeneralResponse<Camera[]>>('/cameras/get-all')
  }
}

export const homeService = new HomeService()
