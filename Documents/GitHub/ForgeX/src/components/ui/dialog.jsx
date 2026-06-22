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
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 DialogPrimitive\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@radix-ui/react-dialog"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ \cf6 \strokec6 X\cf0 \strokec4  \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ cn \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 Dialog\cf0 \strokec4  = \cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Root\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DialogTrigger\cf0 \strokec4  = \cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Trigger\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DialogPortal\cf0 \strokec4  = \cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Portal\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DialogClose\cf0 \strokec4  = \cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Close\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DialogOverlay\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Overlay\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 DialogOverlay\cf0 \strokec4 .displayName = \cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Overlay\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DialogContent\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 DialogPortal\cf0 \strokec4 >\cb1 \
\cb3     <\cf6 \strokec6 DialogOverlay\cf0 \strokec4  />\cb1 \
\cb3     <\cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf2 \strokec2 "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\}>\cb1 \
\cb3       \{children\}\cb1 \
\cb3       <\cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Close\cf0 \cb1 \strokec4 \
\cb3         className=\cf2 \strokec2 "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"\cf0 \strokec4 >\cb1 \
\cb3         <\cf6 \strokec6 X\cf0 \strokec4  className=\cf2 \strokec2 "h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3         <span className=\cf2 \strokec2 "sr-only"\cf0 \strokec4 >\cf6 \strokec6 Close\cf0 \strokec4 </span>\cb1 \
\cb3       </\cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Close\cf0 \strokec4 >\cb1 \
\cb3     </\cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \strokec4 >\cb1 \
\cb3   </\cf6 \strokec6 DialogPortal\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 DialogContent\cf0 \strokec4 .displayName = \cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DialogHeader\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <div\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "flex flex-col space-y-1.5 text-center sm:text-left"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 DialogHeader\cf0 \strokec4 .displayName = \cf2 \strokec2 "DialogHeader"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DialogFooter\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <div\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 DialogFooter\cf0 \strokec4 .displayName = \cf2 \strokec2 "DialogFooter"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DialogTitle\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Title\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "text-lg font-semibold leading-none tracking-tight"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 DialogTitle\cf0 \strokec4 .displayName = \cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Title\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 DialogDescription\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Description\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "text-sm text-muted-foreground"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 DialogDescription\cf0 \strokec4 .displayName = \cf6 \strokec6 DialogPrimitive\cf0 \strokec4 .\cf6 \strokec6 Description\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 Dialog\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DialogPortal\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DialogOverlay\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DialogTrigger\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DialogClose\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DialogContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DialogHeader\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DialogFooter\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DialogTitle\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 DialogDescription\cf0 \strokec4 ,\cb1 \
\cb3 \}\cb1 \
\
}