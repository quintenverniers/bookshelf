import React from 'react'
import {useAsync} from 'react-async'
import {bootstrapAppData} from '../utils/bootstrap'
import * as authClient from '../utils/auth'

const AuthContext = React.createContext()

function AuthProvider(props) {
  const [firstAttemptFinished, setFirstAttemptFinished] = React.useState(false)
  const {
    data = {user: null, listItems: []},
    error,
    isResolved,
    isRejected,
    isPending,
    isSettled,
    setError,
    reload,
  } = useAsync({
    promiseFn: bootstrapAppData,
  })

  React.useLayoutEffect(() => {
    if (isSettled) {
      setFirstAttemptFinished(true)
    }
  }, [isSettled])

  if (!firstAttemptFinished) {
    if (isPending) {
      return '...'
    }
    if (isRejected) {
      return (
        <div style={{color: 'red'}}>
          <p>Uh oh... There's a problem. Try refreshing the app.</p>
          <pre>{error.message}</pre>
        </div>
      )
    }
  }

  const login = form =>
    authClient.login(form).then(reload, error => setError(error))
  const register = form =>
    authClient.register(form).then(reload, error => setError(error))
  const logout = () =>
    authClient.logout().then(reload, error => setError(error))
  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        data,
        login,
        logout,
        register,
        error,
        isRejected,
        isPending,
        isResolved,
        clearError,
      }}
      {...props}
    />
  )
}

function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error(`useAuth must be used within a AuthProvider`)
  }
  return context
}

export {AuthProvider, useAuth}
