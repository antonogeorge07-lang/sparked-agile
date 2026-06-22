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
\cf2 \cb3 \strokec2 import\cf0 \strokec4  * as \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@radix-ui/react-context-menu"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Check\cf0 \strokec4 , \cf5 \strokec5 ChevronRight\cf0 \strokec4 , \cf5 \strokec5 Circle\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenu\cf0 \strokec4  = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Root\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuTrigger\cf0 \strokec4  = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Trigger\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuGroup\cf0 \strokec4  = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Group\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuPortal\cf0 \strokec4  = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Portal\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuSub\cf0 \strokec4  = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Sub\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuRadioGroup\cf0 \strokec4  = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 RadioGroup\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuSubTrigger\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, inset, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 SubTrigger\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"\cf0 \strokec4 ,\cb1 \
\cb3       inset && \cf6 \strokec6 "pl-8"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     \{children\}\cb1 \
\cb3     <\cf5 \strokec5 ChevronRight\cf0 \strokec4  className=\cf6 \strokec6 "ml-auto h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3   </\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 SubTrigger\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ContextMenuSubTrigger\cf0 \strokec4 .displayName = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 SubTrigger\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuSubContent\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 SubContent\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ContextMenuSubContent\cf0 \strokec4 .displayName = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 SubContent\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuContent\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Portal\cf0 \strokec4 >\cb1 \
\cb3     <\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Content\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\} />\cb1 \
\cb3   </\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Portal\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ContextMenuContent\cf0 \strokec4 .displayName = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Content\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuItem\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, inset, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Item\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"\cf0 \strokec4 ,\cb1 \
\cb3       inset && \cf6 \strokec6 "pl-8"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ContextMenuItem\cf0 \strokec4 .displayName = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Item\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuCheckboxItem\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, children, checked, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 CheckboxItem\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     checked=\{checked\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <span className=\cf6 \strokec6 "absolute left-2 flex h-3.5 w-3.5 items-center justify-center"\cf0 \strokec4 >\cb1 \
\cb3       <\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 ItemIndicator\cf0 \strokec4 >\cb1 \
\cb3         <\cf5 \strokec5 Check\cf0 \strokec4  className=\cf6 \strokec6 "h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3       </\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 ItemIndicator\cf0 \strokec4 >\cb1 \
\cb3     </span>\cb1 \
\cb3     \{children\}\cb1 \
\cb3   </\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 CheckboxItem\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ContextMenuCheckboxItem\cf0 \strokec4 .displayName =\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 CheckboxItem\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuRadioItem\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 RadioItem\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <span className=\cf6 \strokec6 "absolute left-2 flex h-3.5 w-3.5 items-center justify-center"\cf0 \strokec4 >\cb1 \
\cb3       <\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 ItemIndicator\cf0 \strokec4 >\cb1 \
\cb3         <\cf5 \strokec5 Circle\cf0 \strokec4  className=\cf6 \strokec6 "h-4 w-4 fill-current"\cf0 \strokec4  />\cb1 \
\cb3       </\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 ItemIndicator\cf0 \strokec4 >\cb1 \
\cb3     </span>\cb1 \
\cb3     \{children\}\cb1 \
\cb3   </\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 RadioItem\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ContextMenuRadioItem\cf0 \strokec4 .displayName = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 RadioItem\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuLabel\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, inset, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Label\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "px-2 py-1.5 text-sm font-semibold text-foreground"\cf0 \strokec4 ,\cb1 \
\cb3       inset && \cf6 \strokec6 "pl-8"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ContextMenuLabel\cf0 \strokec4 .displayName = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Label\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuSeparator\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Separator\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf6 \strokec6 "-mx-1 my-1 h-px bg-border"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 ContextMenuSeparator\cf0 \strokec4 .displayName = \cf5 \strokec5 ContextMenuPrimitive\cf0 \strokec4 .\cf5 \strokec5 Separator\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 ContextMenuShortcut\cf0 \strokec4  = (\{\cb1 \
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
\cf5 \cb3 \strokec5 ContextMenuShortcut\cf0 \strokec4 .displayName = \cf6 \strokec6 "ContextMenuShortcut"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 ContextMenu\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuTrigger\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuItem\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuCheckboxItem\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuRadioItem\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuLabel\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuSeparator\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuShortcut\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuGroup\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuPortal\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuSub\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuSubContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuSubTrigger\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 ContextMenuRadioGroup\cf0 \strokec4 ,\cb1 \
\cb3 \}\cb1 \
\
}