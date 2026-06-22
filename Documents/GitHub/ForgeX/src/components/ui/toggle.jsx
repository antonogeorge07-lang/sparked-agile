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
\cf2 \cb3 \strokec2 import\cf0 \strokec4  * as \cf5 \strokec5 TogglePrimitive\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@radix-ui/react-toggle"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cva \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "class-variance-authority"\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  toggleVariants = cva(\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"\cf0 \strokec4 ,\cb1 \
\cb3   \{\cb1 \
\cb3     variants: \{\cb1 \
\cb3       variant: \{\cb1 \
\cb3         \cf2 \strokec2 default\cf0 \strokec4 : \cf6 \strokec6 "bg-transparent"\cf0 \strokec4 ,\cb1 \
\cb3         outline:\cb1 \
\cb3           \cf6 \strokec6 "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground"\cf0 \strokec4 ,\cb1 \
\cb3       \},\cb1 \
\cb3       size: \{\cb1 \
\cb3         \cf2 \strokec2 default\cf0 \strokec4 : \cf6 \strokec6 "h-9 px-2 min-w-9"\cf0 \strokec4 ,\cb1 \
\cb3         sm: \cf6 \strokec6 "h-8 px-1.5 min-w-8"\cf0 \strokec4 ,\cb1 \
\cb3         lg: \cf6 \strokec6 "h-10 px-2.5 min-w-10"\cf0 \strokec4 ,\cb1 \
\cb3       \},\cb1 \
\cb3     \},\cb1 \
\cb3     defaultVariants: \{\cb1 \
\cb3       variant: \cf6 \strokec6 "default"\cf0 \strokec4 ,\cb1 \
\cb3       size: \cf6 \strokec6 "default"\cf0 \strokec4 ,\cb1 \
\cb3     \},\cb1 \
\cb3   \}\cb1 \
\cb3 )\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Toggle\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, variant, size, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 TogglePrimitive\cf0 \strokec4 .\cf5 \strokec5 Root\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(toggleVariants(\{ variant, size, className \}))\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 Toggle\cf0 \strokec4 .displayName = \cf5 \strokec5 TogglePrimitive\cf0 \strokec4 .\cf5 \strokec5 Root\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \{ \cf5 \strokec5 Toggle\cf0 \strokec4 , toggleVariants \}\cb1 \
\
}