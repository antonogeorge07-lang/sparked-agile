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
\outl0\strokewidth0 \strokec2 "use client"\cf0 \strokec4 ;\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 React\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "react"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 ToggleGroupPrimitive\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@radix-ui/react-toggle-group"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ cn \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@/lib/utils"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ toggleVariants \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@/components/ui/toggle"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ToggleGroupContext\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .createContext(\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   size: \cf2 \strokec2 "default"\cf0 \strokec4 ,\cb1 \
\cb3   variant: \cf2 \strokec2 "default"\cf0 \strokec4 ,\cb1 \
\cb3 \})\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ToggleGroup\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, variant, size, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 ToggleGroupPrimitive\cf0 \strokec4 .\cf6 \strokec6 Root\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "flex items-center justify-center gap-1"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <\cf6 \strokec6 ToggleGroupContext\cf0 \strokec4 .\cf6 \strokec6 Provider\cf0 \strokec4  value=\{\{ variant, size \}\}>\cb1 \
\cb3       \{children\}\cb1 \
\cb3     </\cf6 \strokec6 ToggleGroupContext\cf0 \strokec4 .\cf6 \strokec6 Provider\cf0 \strokec4 >\cb1 \
\cb3   </\cf6 \strokec6 ToggleGroupPrimitive\cf0 \strokec4 .\cf6 \strokec6 Root\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 ToggleGroup\cf0 \strokec4 .displayName = \cf6 \strokec6 ToggleGroupPrimitive\cf0 \strokec4 .\cf6 \strokec6 Root\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ToggleGroupItem\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, children, variant, size, ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 const\cf0 \strokec4  context = \cf6 \strokec6 React\cf0 \strokec4 .useContext(\cf6 \strokec6 ToggleGroupContext\cf0 \strokec4 )\cb1 \
\
\cb3   \cf5 \strokec5 return\cf0 \strokec4  (\cb1 \
\cb3     (<\cf6 \strokec6 ToggleGroupPrimitive\cf0 \strokec4 .\cf6 \strokec6 Item\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\{cn(toggleVariants(\{\cb1 \
\cb3         variant: context.variant || variant,\cb1 \
\cb3         size: context.size || size,\cb1 \
\cb3       \}), className)\}\cb1 \
\cb3       \{...props\}>\cb1 \
\cb3       \{children\}\cb1 \
\cb3     </\cf6 \strokec6 ToggleGroupPrimitive\cf0 \strokec4 .\cf6 \strokec6 Item\cf0 \strokec4 >)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 ToggleGroupItem\cf0 \strokec4 .displayName = \cf6 \strokec6 ToggleGroupPrimitive\cf0 \strokec4 .\cf6 \strokec6 Item\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf0 \strokec4  \{ \cf6 \strokec6 ToggleGroup\cf0 \strokec4 , \cf6 \strokec6 ToggleGroupItem\cf0 \strokec4  \}\cb1 \
\
}