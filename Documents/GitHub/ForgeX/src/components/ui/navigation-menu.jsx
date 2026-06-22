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
\cf2 \cb3 \strokec2 import\cf0 \strokec4  * as \cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@radix-ui/react-navigation-menu"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cva \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "class-variance-authority"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 ChevronDown\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 NavigationMenu\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Root\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "relative z-10 flex max-w-max flex-1 items-center justify-center"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     \{children\}\cb1 \
\cb3     <\cf5 \strokec5 NavigationMenuViewport\cf0 \strokec4  />\cb1 \
\cb3   </\cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Root\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 NavigationMenu\cf0 \strokec4 .displayName = \cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Root\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 NavigationMenuList\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 List\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "group flex flex-1 list-none items-center justify-center space-x-1"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 NavigationMenuList\cf0 \strokec4 .displayName = \cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 List\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 NavigationMenuItem\cf0 \strokec4  = \cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Item\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  navigationMenuTriggerStyle = cva(\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"\cf0 \cb1 \strokec4 \
\cb3 )\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 NavigationMenuTrigger\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Trigger\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(navigationMenuTriggerStyle(), \cf6 \strokec6 "group"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     \{children\}\{\cf6 \strokec6 " "\cf0 \strokec4 \}\cb1 \
\cb3     <\cf5 \strokec5 ChevronDown\cf0 \cb1 \strokec4 \
\cb3       className=\cf6 \strokec6 "relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"\cf0 \cb1 \strokec4 \
\cb3       aria-hidden=\cf6 \strokec6 "true"\cf0 \strokec4  />\cb1 \
\cb3   </\cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Trigger\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 NavigationMenuTrigger\cf0 \strokec4 .displayName = \cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Trigger\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 NavigationMenuContent\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Content\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto "\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 NavigationMenuContent\cf0 \strokec4 .displayName = \cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Content\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 NavigationMenuLink\cf0 \strokec4  = \cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Link\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 NavigationMenuViewport\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div className=\{cn(\cf6 \strokec6 "absolute left-0 top-full flex justify-center"\cf0 \strokec4 )\}>\cb1 \
\cb3     <\cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Viewport\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       \{...props\} />\cb1 \
\cb3   </div>\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 NavigationMenuViewport\cf0 \strokec4 .displayName =\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Viewport\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 NavigationMenuIndicator\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Indicator\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <div\cb1 \
\cb3       className=\cf6 \strokec6 "relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md"\cf0 \strokec4  />\cb1 \
\cb3   </\cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Indicator\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 NavigationMenuIndicator\cf0 \strokec4 .displayName =\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 NavigationMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Indicator\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   navigationMenuTriggerStyle,\cb1 \
\cb3   \cf5 \strokec5 NavigationMenu\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 NavigationMenuList\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 NavigationMenuItem\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 NavigationMenuContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 NavigationMenuTrigger\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 NavigationMenuLink\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 NavigationMenuIndicator\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 NavigationMenuViewport\cf0 \strokec4 ,\cb1 \
\cb3 \}\cb1 \
\
}