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

  async logOut() {
    return await fetcher<GeneralResponse<void>>('/auth/logout', {
      method: 'POST',
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

  async getMeUser() {
    return await fetcher<GeneralResponse<User>>('/users/get-me')
  }
}

export const authServices = new AuthServices()
