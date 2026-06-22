{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red144\green1\blue18;\red14\green110\blue109;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ useEffect \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'react'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf6 \strokec6 Outlet\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'react-router-dom'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ useAuth \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/lib/AuthContext'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf6 \strokec6 UserNotRegisteredError\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/components/UserNotRegisteredError'\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf6 \strokec6 DefaultFallback\cf0 \strokec4  = () => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div className=\cf5 \strokec5 "fixed inset-0 flex items-center justify-center"\cf0 \strokec4 >\cb1 \
\cb3     <div className=\cf5 \strokec5 "w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"\cf0 \strokec4 ></div>\cb1 \
\cb3   </div>\cb1 \
\cb3 );\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf6 \strokec6 ProtectedRoute\cf0 \strokec4 (\{ fallback = <\cf6 \strokec6 DefaultFallback\cf0 \strokec4  />, unauthenticatedElement \}) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  \{ isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth \} = useAuth();\cb1 \
\
\cb3   useEffect(() => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (!authChecked && !isLoadingAuth) \{\cb1 \
\cb3       checkUserAuth();\cb1 \
\cb3     \}\cb1 \
\cb3   \}, [authChecked, isLoadingAuth, checkUserAuth]);\cb1 \
\
\cb3   \cf2 \strokec2 if\cf0 \strokec4  (isLoadingAuth || !authChecked) \{\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  fallback;\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf2 \strokec2 if\cf0 \strokec4  (authError) \{\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (authError.type === \cf5 \strokec5 'user_not_registered'\cf0 \strokec4 ) \{\cb1 \
\cb3       \cf2 \strokec2 return\cf0 \strokec4  <\cf6 \strokec6 UserNotRegisteredError\cf0 \strokec4  />;\cb1 \
\cb3     \}\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  unauthenticatedElement;\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf2 \strokec2 if\cf0 \strokec4  (!isAuthenticated) \{\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  unauthenticatedElement;\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  <\cf6 \strokec6 Outlet\cf0 \strokec4  />;\cb1 \
\cb3 \}\cb1 \
\
}