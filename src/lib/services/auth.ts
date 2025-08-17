import { fetcher } from '@/utils/fetch-api'
import type { ForgotPasswordValues, SignInValues } from '@/lib/schemas/auth'

class AuthServices {
  async signIn(values: SignInValues) {
    return await fetcher<GeneralResponse<SignInResponse>>('/auth/sign-in', {
      method: 'POST',
      data: {
        email: values.email,
        password: values.password,
      },
    })
  }

  async forgotPassword(values: ForgotPasswordValues) {
    return await fetcher<GeneralResponse<Pick<User, 'email'>>>(
      '/users/recovery-password',
      {
        method: 'POST',
        data: values,
      }
    )
  }
}

export const authServices = new AuthServices()
