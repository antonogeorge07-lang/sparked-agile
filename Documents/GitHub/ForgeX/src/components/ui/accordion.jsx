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
\cf2 \cb3 \strokec2 import\cf0 \strokec4  * as \cf5 \strokec5 AccordionPrimitive\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@radix-ui/react-accordion"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 ChevronDown\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Accordion\cf0 \strokec4  = \cf5 \strokec5 AccordionPrimitive\cf0 \strokec4 .\cf5 \strokec5 Root\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 AccordionItem\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 AccordionPrimitive\cf0 \strokec4 .\cf5 \strokec5 Item\cf0 \strokec4  ref=\{ref\} className=\{cn(\cf6 \strokec6 "border-b"\cf0 \strokec4 , className)\} \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 AccordionItem\cf0 \strokec4 .displayName = \cf6 \strokec6 "AccordionItem"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 AccordionTrigger\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 AccordionPrimitive\cf0 \strokec4 .\cf5 \strokec5 Header\cf0 \strokec4  className=\cf6 \strokec6 "flex"\cf0 \strokec4 >\cb1 \
\cb3     <\cf5 \strokec5 AccordionPrimitive\cf0 \strokec4 .\cf5 \strokec5 Trigger\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\}>\cb1 \
\cb3       \{children\}\cb1 \
\cb3       <\cf5 \strokec5 ChevronDown\cf0 \cb1 \strokec4 \
\cb3         className=\cf6 \strokec6 "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"\cf0 \strokec4  />\cb1 \
\cb3     </\cf5 \strokec5 AccordionPrimitive\cf0 \strokec4 .\cf5 \strokec5 Trigger\cf0 \strokec4 >\cb1 \
\cb3   </\cf5 \strokec5 AccordionPrimitive\cf0 \strokec4 .\cf5 \strokec5 Header\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 AccordionTrigger\cf0 \strokec4 .displayName = \cf5 \strokec5 AccordionPrimitive\cf0 \strokec4 .\cf5 \strokec5 Trigger\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 AccordionContent\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 AccordionPrimitive\cf0 \strokec4 .\cf5 \strokec5 Content\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\cf6 \strokec6 "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"\cf0 \cb1 \strokec4 \
\cb3     \{...props\}>\cb1 \
\cb3     <div className=\{cn(\cf6 \strokec6 "pb-4 pt-0"\cf0 \strokec4 , className)\}>\{children\}</div>\cb1 \
\cb3   </\cf5 \strokec5 AccordionPrimitive\cf0 \strokec4 .\cf5 \strokec5 Content\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 AccordionContent\cf0 \strokec4 .displayName = \cf5 \strokec5 AccordionPrimitive\cf0 \strokec4 .\cf5 \strokec5 Content\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \{ \cf5 \strokec5 Accordion\cf0 \strokec4 , \cf5 \strokec5 AccordionItem\cf0 \strokec4 , \cf5 \strokec5 AccordionTrigger\cf0 \strokec4 , \cf5 \strokec5 AccordionContent\cf0 \strokec4  \}\cb1 \
\
}