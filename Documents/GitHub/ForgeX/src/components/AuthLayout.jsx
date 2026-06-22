{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red14\green110\blue109;\red144\green1\blue18;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c50196\c50196;\cssrgb\c63922\c8235\c8235;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \cf5 \strokec5 React\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "react"\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf5 \strokec5 AuthLayout\cf0 \strokec4 (\{ icon: \cf5 \strokec5 Icon\cf0 \strokec4 , title, subtitle, footer, children \}) \{\cb1 \
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <div className=\cf6 \strokec6 "min-h-screen flex items-center justify-center bg-background px-4"\cf0 \strokec4 >\cb1 \
\cb3       <div className=\cf6 \strokec6 "w-full max-w-md"\cf0 \strokec4 >\cb1 \
\cb3         <div className=\cf6 \strokec6 "text-center mb-10"\cf0 \strokec4 >\cb1 \
\cb3           <div className=\cf6 \strokec6 "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4"\cf0 \strokec4 >\cb1 \
\cb3             <\cf5 \strokec5 Icon\cf0 \strokec4  className=\cf6 \strokec6 "w-7 h-7 text-primary-foreground"\cf0 \strokec4  aria-hidden=\cf6 \strokec6 "true"\cf0 \strokec4  />\cb1 \
\cb3           </div>\cb1 \
\cb3           <h1 className=\cf6 \strokec6 "text-3xl font-bold tracking-tight text-foreground"\cf0 \strokec4 >\{title\}</h1>\cb1 \
\cb3           \{subtitle && <p className=\cf6 \strokec6 "text-muted-foreground mt-2"\cf0 \strokec4 >\{subtitle\}</p>\}\cb1 \
\cb3         </div>\cb1 \
\cb3         <div className=\cf6 \strokec6 "bg-card rounded-2xl shadow-sm border border-border p-8"\cf0 \strokec4 >\cb1 \
\cb3           \{children\}\cb1 \
\cb3         </div>\cb1 \
\cb3         \{footer && (\cb1 \
\cb3           <p className=\cf6 \strokec6 "text-center text-sm text-muted-foreground mt-6"\cf0 \strokec4 >\{footer\}</p>\cb1 \
\cb3         )\}\cb1 \
\cb3       </div>\cb1 \
\cb3     </div>\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
\
}