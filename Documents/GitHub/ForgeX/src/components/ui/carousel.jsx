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
\cf2 \cb3 \strokec2 import\cf0 \strokec4  useEmblaCarousel \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "embla-carousel-react"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 ArrowLeft\cf0 \strokec4 , \cf5 \strokec5 ArrowRight\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Button\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/button"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 CarouselContext\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .createContext(\cf2 \strokec2 null\cf0 \strokec4 )\cb1 \
\
\cf2 \cb3 \strokec2 function\cf0 \strokec4  useCarousel() \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  context = \cf5 \strokec5 React\cf0 \strokec4 .useContext(\cf5 \strokec5 CarouselContext\cf0 \strokec4 )\cb1 \
\
\cb3   \cf2 \strokec2 if\cf0 \strokec4  (!context) \{\cb1 \
\cb3     \cf2 \strokec2 throw\cf0 \strokec4  \cf2 \strokec2 new\cf0 \strokec4  \cf5 \strokec5 Error\cf0 \strokec4 (\cf6 \strokec6 "useCarousel must be used within a <Carousel />"\cf0 \strokec4 )\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  context\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Carousel\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \{\cb1 \
\cb3     orientation = \cf6 \strokec6 "horizontal"\cf0 \strokec4 ,\cb1 \
\cb3     opts,\cb1 \
\cb3     setApi,\cb1 \
\cb3     plugins,\cb1 \
\cb3     className,\cb1 \
\cb3     children,\cb1 \
\cb3     ...props\cb1 \
\cb3   \},\cb1 \
\cb3   ref\cb1 \
\cb3 ) => \{\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [carouselRef, api] = useEmblaCarousel(\{\cb1 \
\cb3     ...opts,\cb1 \
\cb3     axis: orientation === \cf6 \strokec6 "horizontal"\cf0 \strokec4  ? \cf6 \strokec6 "x"\cf0 \strokec4  : \cf6 \strokec6 "y"\cf0 \strokec4 ,\cb1 \
\cb3   \}, plugins)\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [canScrollPrev, setCanScrollPrev] = \cf5 \strokec5 React\cf0 \strokec4 .useState(\cf2 \strokec2 false\cf0 \strokec4 )\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [canScrollNext, setCanScrollNext] = \cf5 \strokec5 React\cf0 \strokec4 .useState(\cf2 \strokec2 false\cf0 \strokec4 )\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  onSelect = \cf5 \strokec5 React\cf0 \strokec4 .useCallback((api) => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (!api) \{\cb1 \
\cb3       \cf2 \strokec2 return\cf0 \cb1 \strokec4 \
\cb3     \}\cb1 \
\
\cb3     setCanScrollPrev(api.canScrollPrev())\cb1 \
\cb3     setCanScrollNext(api.canScrollNext())\cb1 \
\cb3   \}, [])\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  scrollPrev = \cf5 \strokec5 React\cf0 \strokec4 .useCallback(() => \{\cb1 \
\cb3     api?.scrollPrev()\cb1 \
\cb3   \}, [api])\cb1 \
\
}