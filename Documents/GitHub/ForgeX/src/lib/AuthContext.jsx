{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red255\green255\blue254;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf0 \cb2 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec3 import React, \{ createContext, useState, useContext, useEffect \} from 'react';\cb1 \
\cb2 import \{ base44 \} from '@/api/base44Client';\cb1 \
\cb2 import \{ appParams \} from '@/lib/app-params';\cb1 \
\cb2 import \{ createAxiosClient \} from '@base44/sdk/dist/utils/axios-client';\cb1 \
\
\cb2 const AuthContext = createContext();\cb1 \
\
\cb2 export const AuthProvider = (\{ children \}) => \{\cb1 \
\cb2   const [user, setUser] = useState(null);\cb1 \
\cb2   const [isAuthenticated, setIsAuthenticated] = useState(false);\cb1 \
\cb2   const [isLoadingAuth, setIsLoadingAuth] = useState(true);\cb1 \
\cb2   const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);\cb1 \
\cb2   const [authError, setAuthError] = useState(null);\cb1 \
\cb2   const [authChecked, setAuthChecked] = useState(false);\cb1 \
\cb2   const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only \{ id, public_settings \}\cb1 \
\
\cb2   useEffect(() => \{\cb1 \
\cb2     checkAppState();\cb1 \
\cb2   \}, []);\cb1 \
\
\cb2   const checkAppState = async () => \{\cb1 \
\cb2     try \{\cb1 \
\cb2       setIsLoadingPublicSettings(true);\cb1 \
\cb2       setAuthError(null);\cb1 \
\cb2       \cb1 \
\cb2       // First, check app public settings (with token if available)\cb1 \
\cb2       // This will tell us if auth is required, user not registered, etc.\cb1 \
\cb2       const appClient = createAxiosClient(\{\cb1 \
\cb2         baseURL: `/api/apps/public`,\cb1 \
\cb2         headers: \{\cb1 \
\cb2           'X-App-Id': appParams.appId\cb1 \
\cb2         \},\cb1 \
\cb2         token: appParams.token, // Include token if available\cb1 \
\cb2         interceptResponses: true\cb1 \
\cb2       \});\cb1 \
\cb2       \cb1 \
\cb2       try \{\cb1 \
\cb2         const publicSettings = await appClient.get(`/prod/public-settings/by-id/$\{appParams.appId\}`);\cb1 \
\cb2         setAppPublicSettings(publicSettings);\cb1 \
\cb2         \cb1 \
\cb2         // If we got the app public settings successfully, check if user is authenticated\cb1 \
\cb2         if (appParams.token) \{\cb1 \
\cb2           await checkUserAuth();\cb1 \
\cb2         \} else \{\cb1 \
\cb2           setIsLoadingAuth(false);\cb1 \
\cb2           setIsAuthenticated(false);\cb1 \
\cb2           setAuthChecked(true);\cb1 \
\cb2         \}\cb1 \
\cb2         setIsLoadingPublicSettings(false);\cb1 \
\cb2       \} catch (appError) \{\cb1 \
\cb2         console.error('App state check failed:', appError);\cb1 \
\cb2         \cb1 \
\cb2         // Handle app-level errors\cb1 \
\cb2         if (appError.status === 403 && appError.data?.extra_data?.reason) \{\cb1 \
\cb2           const reason = appError.data.extra_data.reason;\cb1 \
\cb2           if (reason === 'auth_required') \{\cb1 \
\cb2             setAuthError(\{\cb1 \
\cb2               type: 'auth_required',\cb1 \
\cb2               message: 'Authentication required'\cb1 \
\cb2             \});\cb1 \
\cb2           \} else if (reason === 'user_not_registered') \{\cb1 \
\cb2             setAuthError(\{\cb1 \
\cb2               type: 'user_not_registered',\cb1 \
\cb2               message: 'User not registered for this app'\cb1 \
\cb2             \});\cb1 \
\cb2           \} else \{\cb1 \
\cb2             setAuthError(\{\cb1 \
\cb2               type: reason,\cb1 \
\cb2               message: appError.message\cb1 \
\cb2             \});\cb1 \
\cb2           \}\cb1 \
\cb2         \} else \{\cb1 \
\cb2           setAuthError(\{\cb1 \
\cb2             type: 'unknown',\cb1 \
\cb2             message: appError.message || 'Failed to load app'\cb1 \
\cb2           \});\cb1 \
\cb2         \}\cb1 \
\cb2         setIsLoadingPublicSettings(false);\cb1 \
\cb2         setIsLoadingAuth(false);\cb1 \
\cb2       \}\cb1 \
\cb2     \} catch (error) \{\cb1 \
\cb2       console.error('Unexpected error:', error);\cb1 \
\cb2       setAuthError(\{\cb1 \
\cb2         type: 'unknown',\cb1 \
\cb2         message: error.message || 'An unexpected error occurred'\cb1 \
\cb2       \});\cb1 \
\cb2       setIsLoadingPublicSettings(false);\cb1 \
\cb2       setIsLoadingAuth(false);\cb1 \
\cb2     \}\cb1 \
\cb2   \};\cb1 \
\
\cb2   const checkUserAuth = async () => \{\cb1 \
\cb2     try \{\cb1 \
\cb2       // Now check if the user is authenticated\cb1 \
\cb2       setIsLoadingAuth(true);\cb1 \
\cb2       const currentUser = await base44.auth.me();\cb1 \
\cb2       setUser(currentUser);\cb1 \
\cb2       setIsAuthenticated(true);\cb1 \
\cb2       setIsLoadingAuth(false);\cb1 \
\cb2       setAuthChecked(true);\cb1 \
\cb2     \} catch (error) \{\cb1 \
\cb2       console.error('User auth check failed:', error);\cb1 \
\cb2       setIsLoadingAuth(false);\cb1 \
\cb2       setIsAuthenticated(false);\cb1 \
\cb2       setAuthChecked(true);\cb1 \
\cb2       \cb1 \
\cb2       // If user auth fails, it might be an expired token\cb1 \
\cb2       if (error.status === 401 || error.status === 403) \{\cb1 \
\cb2         setAuthError(\{\cb1 \
\cb2           type: 'auth_required',\cb1 \
\cb2           message: 'Authentication required'\cb1 \
\cb2         \});\cb1 \
\cb2       \}\cb1 \
\cb2     \}\cb1 \
\cb2   \};\cb1 \
\
\cb2   const logout = (shouldRedirect = true) => \{\cb1 \
\cb2     setUser(null);\cb1 \
\cb2     setIsAuthenticated(false);\cb1 \
\cb2     \cb1 \
\cb2     if (shouldRedirect) \{\cb1 \
\cb2       // Use the SDK's logout method which handles token cleanup and redirect\cb1 \
\cb2       base44.auth.logout(window.location.href);\cb1 \
\cb2     \} else \{\cb1 \
\cb2       // Just remove the token without redirect\cb1 \
\cb2       base44.auth.logout();\cb1 \
\cb2     \}\cb1 \
\cb2   \};\cb1 \
\
\cb2   const navigateToLogin = () => \{\cb1 \
\cb2     // Use the SDK's redirectToLogin method\cb1 \
\cb2     base44.auth.redirectToLogin(window.location.href);\cb1 \
\cb2   \};\cb1 \
\
\cb2   return (\cb1 \
\cb2     <AuthContext.Provider value=\{\{ \cb1 \
\cb2       user, \cb1 \
\cb2       isAuthenticated, \cb1 \
\cb2       isLoadingAuth,\cb1 \
\cb2       isLoadingPublicSettings,\cb1 \
\cb2       authError,\cb1 \
\cb2       appPublicSettings,\cb1 \
\cb2       authChecked,\cb1 \
\cb2       logout,\cb1 \
\cb2       navigateToLogin,\cb1 \
\cb2       checkUserAuth,\cb1 \
\cb2       checkAppState\cb1 \
\cb2     \}\}>\cb1 \
\cb2       \{children\}\cb1 \
\cb2     </AuthContext.Provider>\cb1 \
\cb2   );\cb1 \
\cb2 \};\cb1 \
\
\cb2 export const useAuth = () => \{\cb1 \
\cb2   const context = useContext(AuthContext);\cb1 \
\cb2   if (!context) \{\cb1 \
\cb2     throw new Error('useAuth must be used within an AuthProvider');\cb1 \
\cb2   \}\cb1 \
\cb2   return context;\cb1 \
\cb2 \};\cb1 \
\
}