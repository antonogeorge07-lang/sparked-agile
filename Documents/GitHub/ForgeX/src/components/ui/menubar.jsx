{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red144\green1\blue18;\red255\green255\blue254;\red0\green0\blue0;
\red0\green0\blue255;\red14\green110\blue109;\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c63922\c8235\c8235;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c0\c100000;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 "use client"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 React\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "react"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 MenubarPrimitive\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@radix-ui/react-menubar"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ \cf6 \strokec6 Check\cf0 \strokec4 , \cf6 \strokec6 ChevronRight\cf0 \strokec4 , \cf6 \strokec6 Circle\cf0 \strokec4  \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ cn \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 function\cf0 \strokec4  \cf6 \strokec6 MenubarMenu\cf0 \strokec4 (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   ...props\cb1 \
\cb3 \}) \{\cb1 \
\cb3   \cf5 \strokec5 return\cf0 \strokec4  <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Menu\cf0 \strokec4  \{...props\} />;\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 function\cf0 \strokec4  \cf6 \strokec6 MenubarGroup\cf0 \strokec4 (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   ...props\cb1 \
\cb3 \}) \{\cb1 \
\cb3   \cf5 \strokec5 return\cf0 \strokec4  <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Group\cf0 \strokec4  \{...props\} />;\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 function\cf0 \strokec4  \cf6 \strokec6 MenubarPortal\cf0 \strokec4 (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   ...props\cb1 \
\cb3 \}) \{\cb1 \
\cb3   \cf5 \strokec5 return\cf0 \strokec4  <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Portal\cf0 \strokec4  \{...props\} />;\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 function\cf0 \strokec4  \cf6 \strokec6 MenubarRadioGroup\cf0 \strokec4 (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   ...props\cb1 \
\cb3 \}) \{\cb1 \
\cb3   \cf5 \strokec5 return\cf0 \strokec4  <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 RadioGroup\cf0 \strokec4  \{...props\} />;\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 function\cf0 \strokec4  \cf6 \strokec6 MenubarSub\cf0 \strokec4 (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   ...props\cb1 \
\cb3 \}) \{\cb1 \
\cb3   \cf5 \strokec5 return\cf0 \strokec4  <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Sub\cf0 \strokec4  data-slot=\cf2 \strokec2 "menubar-sub"\cf0 \strokec4  \{...props\} />;\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 Menubar\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Root\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 Menubar\cf0 \strokec4 .displayName = \cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Root\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 MenubarTrigger\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Trigger\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 MenubarTrigger\cf0 \strokec4 .displayName = \cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Trigger\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 MenubarSubTrigger\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, inset, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 SubTrigger\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"\cf0 \strokec4 ,\cb1 \
\cb3       inset && \cf2 \strokec2 "pl-8"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     \{children\}\cb1 \
\cb3     <\cf6 \strokec6 ChevronRight\cf0 \strokec4  className=\cf2 \strokec2 "ml-auto h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3   </\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 SubTrigger\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 MenubarSubTrigger\cf0 \strokec4 .displayName = \cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 SubTrigger\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 MenubarSubContent\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 SubContent\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 MenubarSubContent\cf0 \strokec4 .displayName = \cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 SubContent\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 MenubarContent\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \{ className, align = \cf2 \strokec2 "start"\cf0 \strokec4 , alignOffset = -\cf7 \strokec7 4\cf0 \strokec4 , sideOffset = \cf7 \strokec7 8\cf0 \strokec4 , ...props \},\cb1 \
\cb3   ref\cb1 \
\cb3 ) => (\cb1 \
\cb3   <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Portal\cf0 \strokec4 >\cb1 \
\cb3     <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       align=\{align\}\cb1 \
\cb3       alignOffset=\{alignOffset\}\cb1 \
\cb3       sideOffset=\{sideOffset\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf2 \strokec2 "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\} />\cb1 \
\cb3   </\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Portal\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 MenubarContent\cf0 \strokec4 .displayName = \cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Content\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 MenubarItem\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, inset, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Item\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"\cf0 \strokec4 ,\cb1 \
\cb3       inset && \cf2 \strokec2 "pl-8"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 MenubarItem\cf0 \strokec4 .displayName = \cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Item\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 MenubarCheckboxItem\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, children, checked, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 CheckboxItem\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     checked=\{checked\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <span className=\cf2 \strokec2 "absolute left-2 flex h-3.5 w-3.5 items-center justify-center"\cf0 \strokec4 >\cb1 \
\cb3       <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 ItemIndicator\cf0 \strokec4 >\cb1 \
\cb3         <\cf6 \strokec6 Check\cf0 \strokec4  className=\cf2 \strokec2 "h-4 w-4"\cf0 \strokec4  />\cb1 \
\cb3       </\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 ItemIndicator\cf0 \strokec4 >\cb1 \
\cb3     </span>\cb1 \
\cb3     \{children\}\cb1 \
\cb3   </\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 CheckboxItem\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 MenubarCheckboxItem\cf0 \strokec4 .displayName = \cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 CheckboxItem\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 MenubarRadioItem\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, children, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 RadioItem\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf2 \strokec2 "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\}>\cb1 \
\cb3     <span className=\cf2 \strokec2 "absolute left-2 flex h-3.5 w-3.5 items-center justify-center"\cf0 \strokec4 >\cb1 \
\cb3       <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 ItemIndicator\cf0 \strokec4 >\cb1 \
\cb3         <\cf6 \strokec6 Circle\cf0 \strokec4  className=\cf2 \strokec2 "h-4 w-4 fill-current"\cf0 \strokec4  />\cb1 \
\cb3       </\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 ItemIndicator\cf0 \strokec4 >\cb1 \
\cb3     </span>\cb1 \
\cb3     \{children\}\cb1 \
\cb3   </\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 RadioItem\cf0 \strokec4 >\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 MenubarRadioItem\cf0 \strokec4 .displayName = \cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 RadioItem\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 MenubarLabel\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, inset, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Label\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "px-2 py-1.5 text-sm font-semibold"\cf0 \strokec4 , inset && \cf2 \strokec2 "pl-8"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 MenubarLabel\cf0 \strokec4 .displayName = \cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Label\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 MenubarSeparator\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Separator\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     className=\{cn(\cf2 \strokec2 "-mx-1 my-1 h-px bg-muted"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 MenubarSeparator\cf0 \strokec4 .displayName = \cf6 \strokec6 MenubarPrimitive\cf0 \strokec4 .\cf6 \strokec6 Separator\cf0 \strokec4 .displayName\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 MenubarShortcut\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   className,\cb1 \
\cb3   ...props\cb1 \
\cb3 \}) => \{\cb1 \
\cb3   \cf5 \strokec5 return\cf0 \strokec4  (\cb1 \
\cb3     (<span\cb1 \
\cb3       className=\{cn(\cf2 \strokec2 "ml-auto text-xs tracking-widest text-muted-foreground"\cf0 \strokec4 , className)\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 MenubarShortcut\cf0 \strokec4 .displayname = \cf2 \strokec2 "MenubarShortcut"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 Menubar\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarMenu\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarTrigger\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarItem\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarSeparator\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarLabel\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarCheckboxItem\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarRadioGroup\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarRadioItem\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarPortal\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarSubContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarSubTrigger\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarGroup\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarSub\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 MenubarShortcut\cf0 \strokec4 ,\cb1 \
\cb3 \}\cb1 \
\
}