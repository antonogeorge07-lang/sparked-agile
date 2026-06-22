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
\outl0\strokewidth0 \strokec2 "use client"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 React\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "react"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ \cf6 \strokec6 Drawer\cf0 \strokec4  as \cf6 \strokec6 DrawerPrimitive\cf0 \strokec4  \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "vaul"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ cn \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 Drawer\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   shouldScaleBackground = \cf5 \strokec5 true\cf0 \strokec4 ,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <\cf6 \strokec6 DrawerPrimitive\cf0 \strokec4 .\cf6 \strokec6 Root\cf0 \strokec4  shouldScaleBackground=\{shouldScaleBackground\} \{...props\} />\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 Drawer\cf0 \strokec4 .displayName = \cf2 \strokec2 "Drawer"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DrawerTrigger\cf0 \strokec4  = \cf6 \strokec6 DrawerPrimitive\cf0 \strokec4 .\cf6 \strokec6 Trigger\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DrawerPortal\cf0 \strokec4  = \cf6 \strokec6 DrawerPrimitive\cf0 \strokec4 .\cf6 \strokec6 Portal\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DrawerClose\cf0 \strokec4  = \cf6 \strokec6 DrawerPrimitive\cf0 \strokec4 .\cf6 \strokec6 Close\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DrawerOverlay\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 DrawerPrimitive\cf0 \strokec4 .\cf6 \strokec6 Overlay\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "fixed inset-0 z-50 bg-black/80"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 DrawerOverlay\cf0 \strokec4 .displayName = \cf6 \strokec6 DrawerPrimitive\cf0 \strokec4 .\cf6 \strokec6 Overlay\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DrawerContent\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 DrawerPortal\cf0 \strokec4 >\cb1 \
\cb3     <\cf6 \strokec6 DrawerOverlay\cf0 \strokec4  />\cb1 \
\cb3     <\cf6 \strokec6 DrawerPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf2 \strokec2 "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\}>\cb1 \
\cb3       <div className=\cf2 \strokec2 "mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted"\cf0 \strokec4  />\cb1 \
\cb3       \{children\}\cb1 \
\cb3     </\cf6 \strokec6 DrawerPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \strokec4 >\cb1 \
\cb3   </\cf6 \strokec6 DrawerPortal\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 DrawerContent\cf0 \strokec4 .displayName = \cf2 \strokec2 "DrawerContent"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DrawerHeader\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <div\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "grid gap-1.5 p-4 text-center sm:text-left"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 DrawerHeader\cf0 \strokec4 .displayName = \cf2 \strokec2 "DrawerHeader"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DrawerFooter\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <div className=\{cn(\cf2 \strokec2 "mt-auto flex flex-col gap-2 p-4"\cf0 \strokec4 , className)\} \{...props\} />\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 DrawerFooter\cf0 \strokec4 .displayName = \cf2 \strokec2 "DrawerFooter"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DrawerTitle\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 DrawerPrimitive\cf0 \strokec4 .\cf6 \strokec6 Title\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "text-lg font-semibold leading-none tracking-tight"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 DrawerTitle\cf0 \strokec4 .displayName = \cf6 \strokec6 DrawerPrimitive\cf0 \strokec4 .\cf6 \strokec6 Title\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DrawerDescription\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 DrawerPrimitive\cf0 \strokec4 .\cf6 \strokec6 Description\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "text-sm text-muted-foreground"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 DrawerDescription\cf0 \strokec4 .displayName = \cf6 \strokec6 DrawerPrimitive\cf0 \strokec4 .\cf6 \strokec6 Description\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 Drawer\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DrawerPortal\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DrawerOverlay\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DrawerTrigger\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DrawerClose\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DrawerContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DrawerHeader\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DrawerFooter\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DrawerTitle\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DrawerDescription\cf0 \strokec4 ,\cb1 \
\cb3 \}\cb1 \
\
}