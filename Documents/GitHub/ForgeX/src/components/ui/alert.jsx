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
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  * as \cf5 \strokec5 React\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "react"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cva \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "class-variance-authority"\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  alertVariants = cva(\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7"\cf0 \strokec4 ,\cb1 \
\cb3   \{\cb1 \
\cb3     variants: \{\cb1 \
\cb3       variant: \{\cb1 \
\cb3         \cf2 \strokec2 default\cf0 \strokec4 : \cf6 \strokec6 "bg-background text-foreground"\cf0 \strokec4 ,\cb1 \
\cb3         destructive:\cb1 \
\cb3           \cf6 \strokec6 "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"\cf0 \strokec4 ,\cb1 \
\cb3       \},\cb1 \
\cb3     \},\cb1 \
\cb3     defaultVariants: \{\cb1 \
\cb3       variant: \cf6 \strokec6 "default"\cf0 \strokec4 ,\cb1 \
\cb3     \},\cb1 \
\cb3   \}\cb1 \
\cb3 )\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Alert\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, variant, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     role=\cf6 \strokec6 "alert"\cf0 \cb1 \strokec4 \
\cb3     className=\{cn(alertVariants(\{ variant \}), className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 Alert\cf0 \strokec4 .displayName = \cf6 \strokec6 "Alert"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 AlertTitle\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <h5\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf6 \strokec6 "mb-1 font-medium leading-none tracking-tight"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 AlertTitle\cf0 \strokec4 .displayName = \cf6 \strokec6 "AlertTitle"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 AlertDescription\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf6 \strokec6 "text-sm [&_p]:leading-relaxed"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 AlertDescription\cf0 \strokec4 .displayName = \cf6 \strokec6 "AlertDescription"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \{ \cf5 \strokec5 Alert\cf0 \strokec4 , \cf5 \strokec5 AlertTitle\cf0 \strokec4 , \cf5 \strokec5 AlertDescription\cf0 \strokec4  \}\cb1 \
\
}