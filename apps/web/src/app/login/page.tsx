'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store/auth-store'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authApi.login(formData)
      setAuth(response.user, response.access_token)
      toast.success('Login successful!')
      
      // Redirect based on role
      if (response.user.role === 'ADMIN') {
        router.push('/admin/home')
      } else {
        router.push('/user')
      }
    } catch (error: any) {
      // Extract error message from axios error response
      // NestJS returns errors in format: { statusCode, error, message, timestamp }
      let errorMessage = 'Login failed. Please check your credentials and try again.'
      
      if (error.response?.data) {
        const errorData = error.response.data
        
        if (error.response.status === 400 && errorData.message) {
          errorMessage = errorData.message
        } 
        else if (error.response.status === 401 && errorData.message) {
          errorMessage = errorData.message
        }
        else if (errorData.message) {
          errorMessage = errorData.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        icon: '⚠️',
        style: {
          background: '#fee2e2',
          color: '#991b1b',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div 
        className="absolute inset-0 dark:hidden"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        } as React.CSSProperties}
      ></div>
      
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
      
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/20 dark:border-gray-700/50">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Sign in to your account
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                Create one here
              </Link>
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all sm:text-sm bg-white dark:bg-gray-700 shadow-sm hover:shadow-md"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all sm:text-sm bg-white dark:bg-gray-700 shadow-sm hover:shadow-md"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

