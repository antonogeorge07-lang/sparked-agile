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
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Command\cf0 \strokec4  as \cf5 \strokec5 CommandPrimitive\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "cmdk"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Search\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Dialog\cf0 \strokec4 , \cf5 \strokec5 DialogContent\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/dialog"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Command\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 CommandPrimitive\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 Command\cf0 \strokec4 .displayName = \cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 CommandDialog\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   children,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => \{\cb1 \
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<\cf5 \strokec5 Dialog\cf0 \strokec4  \{...props\}>\cb1 \
\cb3       <\cf5 \strokec5 DialogContent\cf0 \strokec4  className=\cf6 \strokec6 "overflow-hidden p-0"\cf0 \strokec4 >\cb1 \
\cb3         <\cf5 \strokec5 Command\cf0 \cb1 \strokec4 \
\cb3           className=\cf6 \strokec6 "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"\cf0 \strokec4 >\cb1 \
\cb3           \{children\}\cb1 \
\cb3         </\cf5 \strokec5 Command\cf0 \strokec4 >\cb1 \
\cb3       </\cf5 \strokec5 DialogContent\cf0 \strokec4 >\cb1 \
\cb3     </\cf5 \strokec5 Dialog\cf0 \strokec4 >)\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 CommandInput\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div className=\cf6 \strokec6 "flex items-center border-b px-3"\cf0 \strokec4  cmdk-input-wrapper=\cf6 \strokec6 ""\cf0 \strokec4 >\cb1 \
\cb3     <\cf5 \strokec5 Search\cf0 \strokec4  className=\cf6 \strokec6 "mr-2 h-4 w-4 shrink-0 opacity-50"\cf0 \strokec4  />\cb1 \
\cb3     <\cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .\cf5 \strokec5 Input\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\} />\cb1 \
\cb3   </div>\cb1 \
\cb3 ))\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 CommandInput\cf0 \strokec4 .displayName = \cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .\cf5 \strokec5 Input\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 CommandList\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .\cf5 \strokec5 List\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf6 \strokec6 "max-h-[300px] overflow-y-auto overflow-x-hidden"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 CommandList\cf0 \strokec4 .displayName = \cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .\cf5 \strokec5 List\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 CommandEmpty\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((props, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .\cf5 \strokec5 Empty\cf0 \strokec4  ref=\{ref\} className=\cf6 \strokec6 "py-6 text-center text-sm"\cf0 \strokec4  \{...props\} />\cb1 \
\cb3 ))\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 CommandEmpty\cf0 \strokec4 .displayName = \cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .\cf5 \strokec5 Empty\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 CommandGroup\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .\cf5 \strokec5 Group\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 CommandGroup\cf0 \strokec4 .displayName = \cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .\cf5 \strokec5 Group\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 CommandSeparator\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .\cf5 \strokec5 Separator\cf0 \strokec4  ref=\{ref\} className=\{cn(\cf6 \strokec6 "-mx-1 h-px bg-border"\cf0 \strokec4 , className)\} \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 CommandSeparator\cf0 \strokec4 .displayName = \cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .\cf5 \strokec5 Separator\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 CommandItem\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .\cf5 \strokec5 Item\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 CommandItem\cf0 \strokec4 .displayName = \cf5 \strokec5 CommandPrimitive\cf0 \strokec4 .\cf5 \strokec5 Item\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 CommandShortcut\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => \{\cb1 \
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<span\cb1 \
\cb3       className=\{cn(\cf6 \strokec6 "ml-auto text-xs tracking-widest text-muted-foreground"\cf0 \strokec4 , className)\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 CommandShortcut\cf0 \strokec4 .displayName = \cf6 \strokec6 "CommandShortcut"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 Command\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 CommandDialog\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 CommandInput\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 CommandList\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 CommandEmpty\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 CommandGroup\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 CommandItem\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 CommandShortcut\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 CommandSeparator\cf0 \strokec4 ,\cb1 \
\cb3 \}\cb1 \
\
}