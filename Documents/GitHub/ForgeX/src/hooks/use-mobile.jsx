{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red14\green110\blue109;\red144\green1\blue18;\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c50196\c50196;\cssrgb\c63922\c8235\c8235;\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  * as \cf5 \strokec5 React\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "react"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 MOBILE_BREAKPOINT\cf0 \strokec4  = \cf7 \cb3 \strokec7 768\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  useIsMobile() \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  [isMobile, setIsMobile] = \cf5 \strokec5 React\cf0 \strokec4 .useState(\cf2 \strokec2 undefined\cf0 \strokec4 )\cb1 \
\
\cb3   \cf5 \strokec5 React\cf0 \strokec4 .useEffect(() => \{\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  mql = window.matchMedia(\cf6 \strokec6 `(max-width: \cf0 \strokec4 $\{\cf5 \strokec5 MOBILE_BREAKPOINT\cf0 \strokec4  - \cf7 \cb3 \strokec7 1\cf0 \cb3 \strokec4 \}\cf6 \strokec6 px)`\cf0 \strokec4 )\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  onChange = () => \{\cb1 \
\cb3       setIsMobile(window.innerWidth < \cf5 \strokec5 MOBILE_BREAKPOINT\cf0 \strokec4 )\cb1 \
\cb3     \}\cb1 \
\cb3     mql.addEventListener(\cf6 \strokec6 "change"\cf0 \strokec4 , onChange)\cb1 \
\cb3     setIsMobile(window.innerWidth < \cf5 \strokec5 MOBILE_BREAKPOINT\cf0 \strokec4 )\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  () => mql.removeEventListener(\cf6 \strokec6 "change"\cf0 \strokec4 , onChange);\cb1 \
\cb3   \}, [])\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  !!isMobile\cb1 \
\cb3 \}\cb1 \
\
}