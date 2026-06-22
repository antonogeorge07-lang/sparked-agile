{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;\red144\green1\blue18;\red255\green255\blue254;\red0\green0\blue0;
\red0\green0\blue255;\red14\green110\blue109;\red88\green94\blue109;\red255\green255\blue255;\red138\green146\blue159;
\red18\green18\blue18;}
{\*\expandedcolortbl;;\cssrgb\c63922\c8235\c8235;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c0\c100000;\cssrgb\c0\c50196\c50196;\cssrgb\c41961\c44706\c50196;\cssrgb\c100000\c100000\c100000;\cssrgb\c61176\c63922\c68627;
\cssrgb\c9020\c9020\c9020;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 "use client"\cf0 \strokec4 ;\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 React\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "react"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 SheetPrimitive\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@radix-ui/react-dialog"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ cva \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "class-variance-authority"\cf0 \strokec4 ;\cb1 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ \cf6 \strokec6 X\cf0 \strokec4  \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ cn \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 Sheet\cf0 \strokec4  = \cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Root\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SheetTrigger\cf0 \strokec4  = \cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Trigger\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SheetClose\cf0 \strokec4  = \cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Close\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SheetPortal\cf0 \strokec4  = \cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Portal\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SheetOverlay\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Overlay\cf0 \cb1 \strokec4 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\}\cb1 \
\cb3     ref=\{ref\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SheetOverlay\cf0 \strokec4 .displayName = \cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Overlay\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  sheetVariants = cva(\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out"\cf0 \strokec4 ,\cb1 \
\cb3   \{\cb1 \
\cb3     variants: \{\cb1 \
\cb3       side: \{\cb1 \
\cb3         top: \cf2 \strokec2 "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top"\cf0 \strokec4 ,\cb1 \
\cb3         bottom:\cb1 \
\cb3           \cf2 \strokec2 "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"\cf0 \strokec4 ,\cb1 \
\cb3         left: \cf2 \strokec2 "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm"\cf0 \strokec4 ,\cb1 \
\cb3         right:\cb1 \
\cb3           \cf2 \strokec2 "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"\cf0 \strokec4 ,\cb1 \
\cb3       \},\cb1 \
\cb3     \},\cb1 \
\cb3     defaultVariants: \{\cb1 \
\cb3       side: \cf2 \strokec2 "right"\cf0 \strokec4 ,\cb1 \
\cb3     \},\cb1 \
\cb3   \}\cb1 \
\cb3 )\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SheetContent\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ side = \cf2 \strokec2 "right"\cf0 \strokec4 , className, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 SheetPortal\cf0 \strokec4 >\cb1 \
\cb3     <\cf6 \strokec6 SheetOverlay\cf0 \strokec4  />\cb1 \
\cb3     <\cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \strokec4  ref=\{ref\} className=\{cn(sheetVariants(\{ side \}), className)\} \{...props\}>\cb1 \
\cb3       <\cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Close\cf0 \cb1 \strokec4 \
\cb3         className=\cf2 \strokec2 "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"\cf0 \strokec4 >\cb1 \
\cb3         <\cf6 \strokec6 X\cf0 \strokec4  className=\cf2 \strokec2 "h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3         <span className=\cf2 \strokec2 "sr-only"\cf0 \strokec4 >\cf6 \strokec6 Close\cf0 \strokec4 </span>\cb1 \
\cb3       </\cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Close\cf0 \strokec4 >\cb1 \
\cb3       \{children\}\cb1 \
\cb3     </\cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \strokec4 >\cb1 \
\cb3   </\cf6 \strokec6 SheetPortal\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SheetContent\cf0 \strokec4 .displayName = \cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SheetHeader\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <div\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "flex flex-col space-y-2 text-center sm:text-left"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SheetHeader\cf0 \strokec4 .displayName = \cf2 \strokec2 "SheetHeader"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SheetFooter\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <div\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SheetFooter\cf0 \strokec4 .displayName = \cf2 \strokec2 "SheetFooter"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SheetTitle\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Title\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "text-lg font-semibold text-foreground"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SheetTitle\cf0 \strokec4 .displayName = \cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Title\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SheetDescription\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Description\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "text-sm text-muted-foreground"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SheetDescription\cf0 \strokec4 .displayName = \cf6 \strokec6 SheetPrimitive\cf0 \strokec4 .\cf6 \strokec6 Description\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 Sheet\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SheetPortal\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SheetOverlay\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SheetTrigger\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SheetClose\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SheetContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SheetHeader\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SheetFooter\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SheetTitle\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SheetDescription\cf0 \strokec4 ,\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0

\f1\fs28 \cf7 \cb8 \strokec7 src\cf9 \strokec9 /\cf7 \strokec7 components\cf9 \strokec9 /\cf7 \strokec7 ui\cf9 \strokec9 /\cf10 \strokec10 sheet.jsx}