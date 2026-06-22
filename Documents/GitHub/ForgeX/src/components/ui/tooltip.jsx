{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red144\green1\blue18;\red255\green255\blue254;\red0\green0\blue0;
\red0\green0\blue255;\red14\green110\blue109;\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c63922\c8235\c8235;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c0\c100000;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 "use client"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 React\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "react"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 TooltipPrimitive\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@radix-ui/react-tooltip"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ cn \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 TooltipProvider\cf0 \strokec4  = \cf6 \strokec6 TooltipPrimitive\cf0 \strokec4 .\cf6 \strokec6 Provider\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 Tooltip\cf0 \strokec4  = \cf6 \strokec6 TooltipPrimitive\cf0 \strokec4 .\cf6 \strokec6 Root\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 TooltipTrigger\cf0 \strokec4  = \cf6 \strokec6 TooltipPrimitive\cf0 \strokec4 .\cf6 \strokec6 Trigger\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 TooltipContent\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, sideOffset = \cf7 \cb3 \strokec7 4\cf0 \cb3 \strokec4 , ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 TooltipPrimitive\cf0 \strokec4 .\cf6 \strokec6 Portal\cf0 \strokec4 >\cb1 \
\cb3     <\cf6 \strokec6 TooltipPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       sideOffset=\{sideOffset\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf2 \strokec2 "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\} />\cb1 \
\cb3   </\cf6 \strokec6 TooltipPrimitive\cf0 \strokec4 .\cf6 \strokec6 Portal\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 TooltipContent\cf0 \strokec4 .displayName = \cf6 \strokec6 TooltipPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf0 \strokec4  \{ \cf6 \strokec6 Tooltip\cf0 \strokec4 , \cf6 \strokec6 TooltipTrigger\cf0 \strokec4 , \cf6 \strokec6 TooltipContent\cf0 \strokec4 , \cf6 \strokec6 TooltipProvider\cf0 \strokec4  \}\cb1 \
\
}