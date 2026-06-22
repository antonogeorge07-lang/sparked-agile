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
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 ChevronLeft\cf0 \strokec4 , \cf5 \strokec5 ChevronRight\cf0 \strokec4 , \cf5 \strokec5 MoreHorizontal\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ buttonVariants \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/button"\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Pagination\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <nav\cb1 \
\cb3     role=\cf6 \strokec6 "navigation"\cf0 \cb1 \strokec4 \
\cb3     aria-label=\cf6 \strokec6 "pagination"\cf0 \cb1 \strokec4 \
\cb3     className=\{cn(\cf6 \strokec6 "mx-auto flex w-full justify-center"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 Pagination\cf0 \strokec4 .displayName = \cf6 \strokec6 "Pagination"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 PaginationContent\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <ul\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf6 \strokec6 "flex flex-row items-center gap-1"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 PaginationContent\cf0 \strokec4 .displayName = \cf6 \strokec6 "PaginationContent"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 PaginationItem\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <li ref=\{ref\} className=\{cn(\cf6 \strokec6 ""\cf0 \strokec4 , className)\} \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 PaginationItem\cf0 \strokec4 .displayName = \cf6 \strokec6 "PaginationItem"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 PaginationLink\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   isActive,\cb1 \
\cb3   size = \cf6 \strokec6 "icon"\cf0 \strokec4 ,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <a\cb1 \
\cb3     aria-current=\{isActive ? \cf6 \strokec6 "page"\cf0 \strokec4  : \cf2 \strokec2 undefined\cf0 \strokec4 \}\cb1 \
\cb3     className=\{cn(buttonVariants(\{\cb1 \
\cb3       variant: isActive ? \cf6 \strokec6 "outline"\cf0 \strokec4  : \cf6 \strokec6 "ghost"\cf0 \strokec4 ,\cb1 \
\cb3       size,\cb1 \
\cb3     \}), className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 PaginationLink\cf0 \strokec4 .displayName = \cf6 \strokec6 "PaginationLink"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 PaginationPrevious\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <\cf5 \strokec5 PaginationLink\cf0 \cb1 \strokec4 \
\cb3     aria-label=\cf6 \strokec6 "Go to previous page"\cf0 \cb1 \strokec4 \
\cb3     size=\cf6 \strokec6 "default"\cf0 \cb1 \strokec4 \
\cb3     className=\{cn(\cf6 \strokec6 "gap-1 pl-2.5"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <\cf5 \strokec5 ChevronLeft\cf0 \strokec4  className=\cf6 \strokec6 "h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3     <span>\cf5 \strokec5 Previous\cf0 \strokec4 </span>\cb1 \
\cb3   </\cf5 \strokec5 PaginationLink\cf0 \strokec4 >\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 PaginationPrevious\cf0 \strokec4 .displayName = \cf6 \strokec6 "PaginationPrevious"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 PaginationNext\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <\cf5 \strokec5 PaginationLink\cf0 \cb1 \strokec4 \
\cb3     aria-label=\cf6 \strokec6 "Go to next page"\cf0 \cb1 \strokec4 \
\cb3     size=\cf6 \strokec6 "default"\cf0 \cb1 \strokec4 \
\cb3     className=\{cn(\cf6 \strokec6 "gap-1 pr-2.5"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <span>\cf5 \strokec5 Next\cf0 \strokec4 </span>\cb1 \
\cb3     <\cf5 \strokec5 ChevronRight\cf0 \strokec4  className=\cf6 \strokec6 "h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3   </\cf5 \strokec5 PaginationLink\cf0 \strokec4 >\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 PaginationNext\cf0 \strokec4 .displayName = \cf6 \strokec6 "PaginationNext"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 PaginationEllipsis\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => (\cb1 \
\cb3   <span\cb1 \
\cb3     aria-hidden\cb1 \
\cb3     className=\{cn(\cf6 \strokec6 "flex h-9 w-9 items-center justify-center"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <\cf5 \strokec5 MoreHorizontal\cf0 \strokec4  className=\cf6 \strokec6 "h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3     <span className=\cf6 \strokec6 "sr-only"\cf0 \strokec4 >\cf5 \strokec5 More\cf0 \strokec4  pages</span>\cb1 \
\cb3   </span>\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 PaginationEllipsis\cf0 \strokec4 .displayName = \cf6 \strokec6 "PaginationEllipsis"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 Pagination\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 PaginationContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 PaginationLink\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 PaginationItem\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 PaginationPrevious\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 PaginationNext\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 PaginationEllipsis\cf0 \strokec4 ,\cb1 \
\cb3 \}\cb1 \
\
}