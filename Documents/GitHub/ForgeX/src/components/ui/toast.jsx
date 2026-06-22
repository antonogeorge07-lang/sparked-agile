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
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  * as \cf5 \strokec5 React\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "react"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cva \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "class-variance-authority"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 X\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "lucide-react"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ToastProvider\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\cf6 \strokec6 "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"\cf0 \cb1 \strokec4 \
\cb3     \{...props\}\cb1 \
\cb3   />\cb1 \
\cb3 ));\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ToastProvider\cf0 \strokec4 .displayName = \cf6 \strokec6 "ToastProvider"\cf0 \strokec4 ;\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ToastViewport\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\cf6 \strokec6 "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"\cf0 \cb1 \strokec4 \
\cb3     \{...props\}\cb1 \
\cb3   />\cb1 \
\cb3 ));\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ToastViewport\cf0 \strokec4 .displayName = \cf6 \strokec6 "ToastViewport"\cf0 \strokec4 ;\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  toastVariants = cva(\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"\cf0 \strokec4 ,\cb1 \
\cb3   \{\cb1 \
\cb3     variants: \{\cb1 \
\cb3       variant: \{\cb1 \
\cb3         \cf2 \strokec2 default\cf0 \strokec4 : \cf6 \strokec6 "border bg-background text-foreground"\cf0 \strokec4 ,\cb1 \
\cb3         destructive:\cb1 \
\cb3           \cf6 \strokec6 "destructive group border-destructive bg-destructive text-destructive-foreground"\cf0 \strokec4 ,\cb1 \
\cb3       \},\cb1 \
\cb3     \},\cb1 \
\cb3     defaultVariants: \{\cb1 \
\cb3       variant: \cf6 \strokec6 "default"\cf0 \strokec4 ,\cb1 \
\cb3     \},\cb1 \
\cb3   \}\cb1 \
\cb3 );\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Toast\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, variant, ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <div\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\{cn(toastVariants(\{ variant \}), className)\}\cb1 \
\cb3       \{...props\}\cb1 \
\cb3     />\cb1 \
\cb3   );\cb1 \
\cb3 \});\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 Toast\cf0 \strokec4 .displayName = \cf6 \strokec6 "Toast"\cf0 \strokec4 ;\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ToastAction\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\}\cb1 \
\cb3   />\cb1 \
\cb3 ));\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ToastAction\cf0 \strokec4 .displayName = \cf6 \strokec6 "ToastAction"\cf0 \strokec4 ;\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ToastClose\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <button\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     toast-close=\cf6 \strokec6 ""\cf0 \cb1 \strokec4 \
\cb3     \{...props\}\cb1 \
\cb3   >\cb1 \
\cb3     <\cf5 \strokec5 X\cf0 \strokec4  className=\cf6 \strokec6 "h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3   </button>\cb1 \
\cb3 ));\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ToastClose\cf0 \strokec4 .displayName = \cf6 \strokec6 "ToastClose"\cf0 \strokec4 ;\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ToastTitle\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf6 \strokec6 "text-sm font-semibold"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\}\cb1 \
\cb3   />\cb1 \
\cb3 ));\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ToastTitle\cf0 \strokec4 .displayName = \cf6 \strokec6 "ToastTitle"\cf0 \strokec4 ;\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ToastDescription\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf6 \strokec6 "text-sm opacity-90"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\}\cb1 \
\cb3   />\cb1 \
\cb3 ));\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ToastDescription\cf0 \strokec4 .displayName = \cf6 \strokec6 "ToastDescription"\cf0 \strokec4 ;\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 ToastProvider\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ToastViewport\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 Toast\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ToastTitle\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ToastDescription\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ToastClose\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ToastAction\cf0 \strokec4 ,\cb1 \
\cb3 \}; \cb1 \
}