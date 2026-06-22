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
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 SelectPrimitive\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@radix-ui/react-select"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ \cf6 \strokec6 Check\cf0 \strokec4 , \cf6 \strokec6 ChevronDown\cf0 \strokec4 , \cf6 \strokec6 ChevronUp\cf0 \strokec4  \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ cn \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 Select\cf0 \strokec4  = \cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Root\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SelectGroup\cf0 \strokec4  = \cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Group\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SelectValue\cf0 \strokec4  = \cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Value\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SelectTrigger\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Trigger\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     \{children\}\cb1 \
\cb3     <\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Icon\cf0 \strokec4  asChild>\cb1 \
\cb3       <\cf6 \strokec6 ChevronDown\cf0 \strokec4  className=\cf2 \strokec2 "h-4 w-4 opacity-50"\cf0 \strokec4  />\cb1 \
\cb3     </\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Icon\cf0 \strokec4 >\cb1 \
\cb3   </\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Trigger\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SelectTrigger\cf0 \strokec4 .displayName = \cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Trigger\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SelectScrollUpButton\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 ScrollUpButton\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "flex cursor-default items-center justify-center py-1"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <\cf6 \strokec6 ChevronUp\cf0 \strokec4  className=\cf2 \strokec2 "h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3   </\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 ScrollUpButton\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SelectScrollUpButton\cf0 \strokec4 .displayName = \cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 ScrollUpButton\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SelectScrollDownButton\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 ScrollDownButton\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "flex cursor-default items-center justify-center py-1"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <\cf6 \strokec6 ChevronDown\cf0 \strokec4  className=\cf2 \strokec2 "h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3   </\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 ScrollDownButton\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SelectScrollDownButton\cf0 \strokec4 .displayName =\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 ScrollDownButton\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SelectContent\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, children, position = \cf2 \strokec2 "popper"\cf0 \strokec4 , ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Portal\cf0 \strokec4 >\cb1 \
\cb3     <\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf2 \strokec2 "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"\cf0 \strokec4 ,\cb1 \
\cb3         position === \cf2 \strokec2 "popper"\cf0 \strokec4  &&\cb1 \
\cb3           \cf2 \strokec2 "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       position=\{position\}\cb1 \
\cb3       \{...props\}>\cb1 \
\cb3       <\cf6 \strokec6 SelectScrollUpButton\cf0 \strokec4  />\cb1 \
\cb3       <\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Viewport\cf0 \cb1 \strokec4 \
\cb3         className=\{cn(\cf2 \strokec2 "p-1"\cf0 \strokec4 , position === \cf2 \strokec2 "popper"\cf0 \strokec4  &&\cb1 \
\cb3           \cf2 \strokec2 "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"\cf0 \strokec4 )\}>\cb1 \
\cb3         \{children\}\cb1 \
\cb3       </\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Viewport\cf0 \strokec4 >\cb1 \
\cb3       <\cf6 \strokec6 SelectScrollDownButton\cf0 \strokec4  />\cb1 \
\cb3     </\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \strokec4 >\cb1 \
\cb3   </\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Portal\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SelectContent\cf0 \strokec4 .displayName = \cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SelectLabel\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Label\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "px-2 py-1.5 text-sm font-semibold"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SelectLabel\cf0 \strokec4 .displayName = \cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Label\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SelectItem\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Item\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <span className=\cf2 \strokec2 "absolute right-2 flex h-3.5 w-3.5 items-center justify-center"\cf0 \strokec4 >\cb1 \
\cb3       <\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 ItemIndicator\cf0 \strokec4 >\cb1 \
\cb3         <\cf6 \strokec6 Check\cf0 \strokec4  className=\cf2 \strokec2 "h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3       </\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 ItemIndicator\cf0 \strokec4 >\cb1 \
\cb3     </span>\cb1 \
\cb3     <\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 ItemText\cf0 \strokec4 >\{children\}</\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 ItemText\cf0 \strokec4 >\cb1 \
\cb3   </\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Item\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SelectItem\cf0 \strokec4 .displayName = \cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Item\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 SelectSeparator\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Separator\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "-mx-1 my-1 h-px bg-muted"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 SelectSeparator\cf0 \strokec4 .displayName = \cf6 \strokec6 SelectPrimitive\cf0 \strokec4 .\cf6 \strokec6 Separator\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 Select\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SelectGroup\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SelectValue\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SelectTrigger\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SelectContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SelectLabel\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SelectItem\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SelectSeparator\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SelectScrollUpButton\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 SelectScrollDownButton\cf0 \strokec4 ,\cb1 \
\cb3 \}\cb1 \
\
}