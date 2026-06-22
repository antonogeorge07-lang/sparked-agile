{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red144\green1\blue18;\red19\green118\blue70;\red14\green110\blue109;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c63922\c8235\c8235;\cssrgb\c3529\c52549\c34510;\cssrgb\c0\c50196\c50196;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ useEffect \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 "react"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ useLocation, useNavigationType \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 "react-router-dom"\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  getHashId = (hash) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  rawId = hash.slice(\cf6 \cb3 \strokec6 1\cf0 \cb3 \strokec4 );\cb1 \
\
\cb3   \cf2 \strokec2 try\cf0 \strokec4  \{\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  decodeURIComponent(rawId);\cb1 \
\cb3   \} \cf2 \strokec2 catch\cf0 \strokec4  \{\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  rawId;\cb1 \
\cb3   \}\cb1 \
\cb3 \};\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf7 \strokec7 ScrollToTop\cf0 \strokec4 () \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  \{ pathname, hash \} = useLocation();\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  navigationType = useNavigationType();\cb1 \
\
\cb3   useEffect(() => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (navigationType === \cf5 \strokec5 "POP"\cf0 \strokec4 ) \cf2 \strokec2 return\cf0 \strokec4 ;\cb1 \
\
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (hash) \{\cb1 \
\cb3       \cf2 \strokec2 const\cf0 \strokec4  id = getHashId(hash);\cb1 \
\cb3       \cf2 \strokec2 const\cf0 \strokec4  timer = window.setTimeout(() => \{\cb1 \
\cb3         document.getElementById(id)?.scrollIntoView(\{ behavior: \cf5 \strokec5 "smooth"\cf0 \strokec4  \});\cb1 \
\cb3       \}, \cf6 \cb3 \strokec6 50\cf0 \cb3 \strokec4 );\cb1 \
\cb3       \cf2 \strokec2 return\cf0 \strokec4  () => window.clearTimeout(timer);\cb1 \
\cb3     \}\cb1 \
\
\cb3     window.scrollTo(\{ top: \cf6 \cb3 \strokec6 0\cf0 \cb3 \strokec4 , left: \cf6 \cb3 \strokec6 0\cf0 \cb3 \strokec4 , behavior: \cf5 \strokec5 "instant"\cf0 \strokec4  \});\cb1 \
\cb3   \}, [pathname, hash, navigationType]);\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  \cf2 \strokec2 null\cf0 \strokec4 ;\cb1 \
\cb3 \}\cb1 \
\
}