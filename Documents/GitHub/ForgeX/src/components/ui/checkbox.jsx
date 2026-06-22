{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red14\green110\blue109;\red144\green1\blue18;\red88\green94\blue109;\red255\green255\blue255;\red138\green146\blue159;
\red18\green18\blue18;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c50196\c50196;\cssrgb\c63922\c8235\c8235;\cssrgb\c41961\c44706\c50196;\cssrgb\c100000\c100000\c100000;\cssrgb\c61176\c63922\c68627;
\cssrgb\c9020\c9020\c9020;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  * as \cf5 \strokec5 React\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "react"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  * as \cf5 \strokec5 CheckboxPrimitive\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@radix-ui/react-checkbox"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Check\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Checkbox\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 CheckboxPrimitive\cf0 \strokec4 .\cf5 \strokec5 Root\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <\cf5 \strokec5 CheckboxPrimitive\cf0 \strokec4 .\cf5 \strokec5 Indicator\cf0 \strokec4  className=\{cn(\cf6 \strokec6 "flex items-center justify-center text-current"\cf0 \strokec4 )\}>\cb1 \
\cb3       <\cf5 \strokec5 Check\cf0 \strokec4  className=\cf6 \strokec6 "h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3     </\cf5 \strokec5 CheckboxPrimitive\cf0 \strokec4 .\cf5 \strokec5 Indicator\cf0 \strokec4 >\cb1 \
\cb3   </\cf5 \strokec5 CheckboxPrimitive\cf0 \strokec4 .\cf5 \strokec5 Root\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 Checkbox\cf0 \strokec4 .displayName = \cf5 \strokec5 CheckboxPrimitive\cf0 \strokec4 .\cf5 \strokec5 Root\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \{ \cf5 \strokec5 Checkbox\cf0 \strokec4  \}\cb1 \
\
\pard\pardeftab720\partightenfactor0

\f1\fs28 \cf7 \cb8 \strokec7 src\cf9 \strokec9 /\cf7 \strokec7 components\cf9 \strokec9 /\cf7 \strokec7 ui\cf9 \strokec9 /\cf10 \strokec10 checkbox.jsx}