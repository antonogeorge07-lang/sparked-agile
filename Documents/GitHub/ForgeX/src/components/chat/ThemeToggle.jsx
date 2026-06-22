{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red144\green1\blue18;\red14\green110\blue109;\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ useTheme \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'next-themes'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ motion \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'framer-motion'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf6 \strokec6 Sun\cf0 \strokec4 , \cf6 \strokec6 Moon\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'lucide-react'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ useEffect, useState \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'react'\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf6 \strokec6 ThemeToggle\cf0 \strokec4 () \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  \{ theme, setTheme \} = useTheme();\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [mounted, setMounted] = useState(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\
\cb3   useEffect(() => setMounted(\cf2 \strokec2 true\cf0 \strokec4 ), []);\cb1 \
\
\cb3   \cf2 \strokec2 if\cf0 \strokec4  (!mounted) \cf2 \strokec2 return\cf0 \strokec4  <div className=\cf5 \strokec5 "w-9 h-9"\cf0 \strokec4  />;\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <motion.button\cb1 \
\cb3       whileTap=\{\{ scale: \cf7 \strokec7 0.9\cf0 \strokec4  \}\}\cb1 \
\cb3       onClick=\{() => setTheme(theme === \cf5 \strokec5 'dark'\cf0 \strokec4  ? \cf5 \strokec5 'light'\cf0 \strokec4  : \cf5 \strokec5 'dark'\cf0 \strokec4 )\}\cb1 \
\cb3       className=\cf5 \strokec5 "p-2 rounded-xl hover:bg-[var(--glass-hover)] transition-colors"\cf0 \cb1 \strokec4 \
\cb3       aria-label=\cf5 \strokec5 "Toggle theme"\cf0 \cb1 \strokec4 \
\cb3     >\cb1 \
\cb3       \{theme === \cf5 \strokec5 'dark'\cf0 \strokec4  ? (\cb1 \
\cb3         <\cf6 \strokec6 Sun\cf0 \strokec4  className=\cf5 \strokec5 "w-4 h-4 text-foreground/70"\cf0 \strokec4  />\cb1 \
\cb3       ) : (\cb1 \
\cb3         <\cf6 \strokec6 Moon\cf0 \strokec4  className=\cf5 \strokec5 "w-4 h-4 text-foreground/70"\cf0 \strokec4  />\cb1 \
\cb3       )\}\cb1 \
\cb3     </motion.button>\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
}