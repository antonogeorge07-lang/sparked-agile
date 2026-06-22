{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red144\green1\blue18;\red14\green110\blue109;\red19\green118\blue70;\red15\green112\blue1;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;\cssrgb\c0\c50196\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ useLocation \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'react-router-dom'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ base44 \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/api/base44Client'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ useQuery \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@tanstack/react-query'\cf0 \strokec4 ;\cb1 \
\
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf6 \strokec6 PageNotFound\cf0 \strokec4 (\{\}) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3     \cf2 \strokec2 const\cf0 \strokec4  location = useLocation();\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  pageName = location.pathname.substring(\cf7 \cb3 \strokec7 1\cf0 \cb3 \strokec4 );\cb1 \
\
\cb3     \cf2 \strokec2 const\cf0 \strokec4  \{ data: authData, isFetched \} = useQuery(\{\cb1 \
\cb3         queryKey: [\cf5 \strokec5 'user'\cf0 \strokec4 ],\cb1 \
\cb3         queryFn: \cf2 \strokec2 async\cf0 \strokec4  () => \{\cb1 \
\cb3             \cf2 \strokec2 try\cf0 \strokec4  \{\cb1 \
\cb3                 \cf2 \strokec2 const\cf0 \strokec4  user = \cf2 \strokec2 await\cf0 \strokec4  base44.auth.me();\cb1 \
\cb3                 \cf2 \strokec2 return\cf0 \strokec4  \{ user, isAuthenticated: \cf2 \strokec2 true\cf0 \strokec4  \};\cb1 \
\cb3             \} \cf2 \strokec2 catch\cf0 \strokec4  (error) \{\cb1 \
\cb3                 \cf2 \strokec2 return\cf0 \strokec4  \{ user: \cf2 \strokec2 null\cf0 \strokec4 , isAuthenticated: \cf2 \strokec2 false\cf0 \strokec4  \};\cb1 \
\cb3             \}\cb1 \
\cb3         \}\cb1 \
\cb3     \});\cb1 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3         <div className=\cf5 \strokec5 "min-h-screen flex items-center justify-center p-6 bg-slate-50"\cf0 \strokec4 >\cb1 \
\cb3             <div className=\cf5 \strokec5 "max-w-md w-full"\cf0 \strokec4 >\cb1 \
\cb3                 <div className=\cf5 \strokec5 "text-center space-y-6"\cf0 \strokec4 >\cb1 \
\cb3                     \{\cf8 \cb3 \strokec8 /* 404 Error Code */\cf0 \cb3 \strokec4 \}\cb1 \
\cb3                     <div className=\cf5 \strokec5 "space-y-2"\cf0 \strokec4 >\cb1 \
\cb3                         <h1 className=\cf5 \strokec5 "text-7xl font-light text-slate-300"\cf0 \strokec4 >\cf7 \cb3 \strokec7 404\cf0 \cb3 \strokec4 </h1>\cb1 \
\cb3                         <div className=\cf5 \strokec5 "h-0.5 w-16 bg-slate-200 mx-auto"\cf0 \strokec4 ></div>\cb1 \
\cb3                     </div>\cb1 \
\cb3                     \cb1 \
\cb3                     \{\cf8 \cb3 \strokec8 /* Main Message */\cf0 \cb3 \strokec4 \}\cb1 \
\cb3                     <div className=\cf5 \strokec5 "space-y-3"\cf0 \strokec4 >\cb1 \
\cb3                         <h2 className=\cf5 \strokec5 "text-2xl font-medium text-slate-800"\cf0 \strokec4 >\cb1 \
\cb3                             \cf6 \strokec6 Page\cf0 \strokec4  \cf6 \strokec6 Not\cf0 \strokec4  \cf6 \strokec6 Found\cf0 \cb1 \strokec4 \
\cb3                         </h2>\cb1 \
\cb3                         <p className=\cf5 \strokec5 "text-slate-600 leading-relaxed"\cf0 \strokec4 >\cb1 \
\cb3                             \cf6 \strokec6 The\cf0 \strokec4  page <span className=\cf5 \strokec5 "font-medium text-slate-700"\cf0 \strokec4 >\cf5 \strokec5 "\{pageName\}"\cf0 \strokec4 </span> could not be found \cf2 \strokec2 in\cf0 \strokec4  \cf2 \strokec2 this\cf0 \strokec4  application.\cb1 \
\cb3                         </p>\cb1 \
\cb3                     </div>\cb1 \
\cb3                     \cb1 \
\cb3                     \{\cf8 \cb3 \strokec8 /* Admin Note */\cf0 \cb3 \strokec4 \}\cb1 \
\cb3                     \{isFetched && authData.isAuthenticated && authData.user?.role === \cf5 \strokec5 'admin'\cf0 \strokec4  && (\cb1 \
\cb3                         <div className=\cf5 \strokec5 "mt-8 p-4 bg-slate-100 rounded-lg border border-slate-200"\cf0 \strokec4 >\cb1 \
\cb3                             <div className=\cf5 \strokec5 "flex items-start space-x-3"\cf0 \strokec4 >\cb1 \
\cb3                                 <div className=\cf5 \strokec5 "flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mt-0.5"\cf0 \strokec4 >\cb1 \
\cb3                                     <div className=\cf5 \strokec5 "w-2 h-2 rounded-full bg-orange-400"\cf0 \strokec4 ></div>\cb1 \
\cb3                                 </div>\cb1 \
\cb3                                 <div className=\cf5 \strokec5 "text-left space-y-1"\cf0 \strokec4 >\cb1 \
\cb3                                     <p className=\cf5 \strokec5 "text-sm font-medium text-slate-700"\cf0 \strokec4 >\cf6 \strokec6 Admin\cf0 \strokec4  \cf6 \strokec6 Note\cf0 \strokec4 </p>\cb1 \
\cb3                                     <p className=\cf5 \strokec5 "text-sm text-slate-600 leading-relaxed"\cf0 \strokec4 >\cb1 \
\cb3                                         \cf6 \strokec6 This\cf0 \strokec4  could mean that the \cf6 \strokec6 AI\cf0 \strokec4  hasn\cf5 \strokec5 't implemented this page yet. Ask it to implement it in the chat.\cf0 \cb1 \strokec4 \
\cb3                                     </p>\cb1 \
\cb3                                 </div>\cb1 \
\cb3                             </div>\cb1 \
\cb3                         </div>\cb1 \
\cb3                     )\}\cb1 \
\cb3                     \cb1 \
\cb3                     \{\cf8 \cb3 \strokec8 /* Action Button */\cf0 \cb3 \strokec4 \}\cb1 \
\cb3                     <div className=\cf5 \strokec5 "pt-6"\cf0 \strokec4 >\cb1 \
\cb3                         <button \cb1 \
\cb3                             onClick=\{() => window.location.href = \cf5 \strokec5 '/'\cf0 \strokec4 \} \cb1 \
\cb3                             className=\cf5 \strokec5 "inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"\cf0 \cb1 \strokec4 \
\cb3                         >\cb1 \
\cb3                             <svg className=\cf5 \strokec5 "w-4 h-4 mr-2"\cf0 \strokec4  fill=\cf5 \strokec5 "none"\cf0 \strokec4  stroke=\cf5 \strokec5 "currentColor"\cf0 \strokec4  viewBox=\cf5 \strokec5 "0 0 24 24"\cf0 \strokec4 >\cb1 \
\cb3                                 <path strokeLinecap=\cf5 \strokec5 "round"\cf0 \strokec4  strokeLinejoin=\cf5 \strokec5 "round"\cf0 \strokec4  strokeWidth=\{\cf7 \cb3 \strokec7 2\cf0 \cb3 \strokec4 \} d=\cf5 \strokec5 "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"\cf0 \strokec4  />\cb1 \
\cb3                             </svg>\cb1 \
\cb3                             \cf6 \strokec6 Go\cf0 \strokec4  \cf6 \strokec6 Home\cf0 \cb1 \strokec4 \
\cb3                         </button>\cb1 \
\cb3                     </div>\cb1 \
\cb3                 </div>\cb1 \
\cb3             </div>\cb1 \
\cb3         </div>\cb1 \
\cb3     )\cb1 \
\cb3 \}\cb1 \
}