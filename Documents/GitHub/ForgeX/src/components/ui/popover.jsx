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
\cf2 \cb3 \strokec2 import\cf0 \strokec4  * as \cf5 \strokec5 PopoverPrimitive\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@radix-ui/react-popover"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Popover\cf0 \strokec4  = \cf5 \strokec5 PopoverPrimitive\cf0 \strokec4 .\cf5 \strokec5 Root\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 PopoverTrigger\cf0 \strokec4  = \cf5 \strokec5 PopoverPrimitive\cf0 \strokec4 .\cf5 \strokec5 Trigger\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 PopoverAnchor\cf0 \strokec4  = \cf5 \strokec5 PopoverPrimitive\cf0 \strokec4 .\cf5 \strokec5 Anchor\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 PopoverContent\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, align = \cf6 \strokec6 "center"\cf0 \strokec4 , sideOffset = \cf7 \strokec7 4\cf0 \strokec4 , ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 PopoverPrimitive\cf0 \strokec4 .\cf5 \strokec5 Portal\cf0 \strokec4 >\cb1 \
\cb3     <\cf5 \strokec5 PopoverPrimitive\cf0 \strokec4 .\cf5 \strokec5 Content\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       align=\{align\}\cb1 \
\cb3       sideOffset=\{sideOffset\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\} />\cb1 \
\cb3   </\cf5 \strokec5 PopoverPrimitive\cf0 \strokec4 .\cf5 \strokec5 Portal\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 PopoverContent\cf0 \strokec4 .displayName = \cf5 \strokec5 PopoverPrimitive\cf0 \strokec4 .\cf5 \strokec5 Content\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \{ \cf5 \strokec5 Popover\cf0 \strokec4 , \cf5 \strokec5 PopoverTrigger\cf0 \strokec4 , \cf5 \strokec5 PopoverContent\cf0 \strokec4 , \cf5 \strokec5 PopoverAnchor\cf0 \strokec4  \}\cb1 \
\
}