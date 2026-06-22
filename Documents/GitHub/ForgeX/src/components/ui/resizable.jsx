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
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ \cf6 \strokec6 GripVertical\cf0 \strokec4  \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "lucide-react"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 ResizablePrimitive\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "react-resizable-panels"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ cn \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ResizablePanelGroup\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <\cf6 \strokec6 ResizablePrimitive\cf0 \strokec4 .\cf6 \strokec6 PanelGroup\cf0 \cb1 \strokec4 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "flex h-full w-full data-[panel-group-direction=vertical]:flex-col"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 )\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ResizablePanel\cf0 \strokec4  = \cf6 \strokec6 ResizablePrimitive\cf0 \strokec4 .\cf6 \strokec6 Panel\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ResizableHandle\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   withHandle,\cb1 \
\cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <\cf6 \strokec6 ResizablePrimitive\cf0 \strokec4 .\cf6 \strokec6 PanelResizeHandle\cf0 \cb1 \strokec4 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     \{withHandle && (\cb1 \
\cb3       <div\cb1 \
\cb3         className=\cf2 \strokec2 "z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border"\cf0 \strokec4 >\cb1 \
\cb3         <\cf6 \strokec6 GripVertical\cf0 \strokec4  className=\cf2 \strokec2 "h-2.5 w-2.5"\cf0 \strokec4  />\cb1 \
\cb3       </div>\cb1 \
\cb3     )\}\cb1 \
\cb3   </\cf6 \strokec6 ResizablePrimitive\cf0 \strokec4 .\cf6 \strokec6 PanelResizeHandle\cf0 \strokec4 >\cb1 \
\cb3 )\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf0 \strokec4  \{ \cf6 \strokec6 ResizablePanelGroup\cf0 \strokec4 , \cf6 \strokec6 ResizablePanel\cf0 \strokec4 , \cf6 \strokec6 ResizableHandle\cf0 \strokec4  \}\cb1 \
\
}