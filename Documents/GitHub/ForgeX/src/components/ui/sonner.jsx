{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red144\green1\blue18;\red255\green255\blue254;\red0\green0\blue0;
\red0\green0\blue255;\red14\green110\blue109;}
{\*\expandedcolortbl;;\cssrgb\c63922\c8235\c8235;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c0\c100000;\cssrgb\c0\c50196\c50196;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 "use client"\cf0 \strokec4 ;\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ useTheme \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "next-themes"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ \cf6 \strokec6 Toaster\cf0 \strokec4  as \cf6 \strokec6 Sonner\cf0 \strokec4  \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "sonner"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 Toaster\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   ...props\cb1 \
\cb3 \}) => \{\cb1 \
\cb3   \cf5 \strokec5 const\cf0 \strokec4  \{ theme = \cf2 \strokec2 "system"\cf0 \strokec4  \} = useTheme()\cb1 \
\
\cb3   \cf5 \strokec5 return\cf0 \strokec4  (\cb1 \
\cb3     (<\cf6 \strokec6 Sonner\cf0 \cb1 \strokec4 \
\cb3       theme=\{theme\}\cb1 \
\cb3       className=\cf2 \strokec2 "toaster group"\cf0 \cb1 \strokec4 \
\cb3       toastOptions=\{\{\cb1 \
\cb3         classNames: \{\cb1 \
\cb3           toast:\cb1 \
\cb3             \cf2 \strokec2 "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg"\cf0 \strokec4 ,\cb1 \
\cb3           description: \cf2 \strokec2 "group-[.toast]:text-muted-foreground"\cf0 \strokec4 ,\cb1 \
\cb3           actionButton:\cb1 \
\cb3             \cf2 \strokec2 "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground"\cf0 \strokec4 ,\cb1 \
\cb3           cancelButton:\cb1 \
\cb3             \cf2 \strokec2 "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"\cf0 \strokec4 ,\cb1 \
\cb3         \},\cb1 \
\cb3       \}\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf0 \strokec4  \{ \cf6 \strokec6 Toaster\cf0 \strokec4  \}\cb1 \
\
}