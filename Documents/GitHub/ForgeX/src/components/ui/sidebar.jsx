{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red14\green110\blue109;\red144\green1\blue18;\red19\green118\blue70;\red15\green112\blue1;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c50196\c50196;\cssrgb\c63922\c8235\c8235;\cssrgb\c3529\c52549\c34510;\cssrgb\c0\c50196\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  * as \cf5 \strokec5 React\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "react"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Slot\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@radix-ui/react-slot"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cva \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "class-variance-authority"\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 PanelLeft\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ useIsMobile \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/hooks/use-mobile"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Button\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/button"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Input\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/input"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Separator\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/separator"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Sheet\cf0 \strokec4 , \cf5 \strokec5 SheetContent\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/sheet"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Skeleton\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/skeleton"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 Tooltip\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 TooltipContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 TooltipProvider\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 TooltipTrigger\cf0 \strokec4 ,\cb1 \
\cb3 \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/components/ui/tooltip"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SIDEBAR_COOKIE_NAME\cf0 \strokec4  = \cf6 \strokec6 "sidebar_state"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SIDEBAR_COOKIE_MAX_AGE\cf0 \strokec4  = \cf7 \cb3 \strokec7 60\cf0 \cb3 \strokec4  * \cf7 \cb3 \strokec7 60\cf0 \cb3 \strokec4  * \cf7 \cb3 \strokec7 24\cf0 \cb3 \strokec4  * \cf7 \cb3 \strokec7 7\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SIDEBAR_WIDTH\cf0 \strokec4  = \cf6 \strokec6 "16rem"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SIDEBAR_WIDTH_MOBILE\cf0 \strokec4  = \cf6 \strokec6 "18rem"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SIDEBAR_WIDTH_ICON\cf0 \strokec4  = \cf6 \strokec6 "3rem"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SIDEBAR_KEYBOARD_SHORTCUT\cf0 \strokec4  = \cf6 \strokec6 "b"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarContext\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .createContext(\cf2 \strokec2 null\cf0 \strokec4 )\cb1 \
\
\cf2 \cb3 \strokec2 function\cf0 \strokec4  useSidebar() \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  context = \cf5 \strokec5 React\cf0 \strokec4 .useContext(\cf5 \strokec5 SidebarContext\cf0 \strokec4 )\cb1 \
\cb3   \cf2 \strokec2 if\cf0 \strokec4  (!context) \{\cb1 \
\cb3     \cf2 \strokec2 throw\cf0 \strokec4  \cf2 \strokec2 new\cf0 \strokec4  \cf5 \strokec5 Error\cf0 \strokec4 (\cf6 \strokec6 "useSidebar must be used within a SidebarProvider."\cf0 \strokec4 )\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  context\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarProvider\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \{\cb1 \
\cb3     defaultOpen = \cf2 \strokec2 true\cf0 \strokec4 ,\cb1 \
\cb3     open: openProp,\cb1 \
\cb3     onOpenChange: setOpenProp,\cb1 \
\cb3     className,\cb1 \
\cb3     style,\cb1 \
\cb3     children,\cb1 \
\cb3     ...props\cb1 \
\cb3   \},\cb1 \
\cb3   ref\cb1 \
\cb3 ) => \{\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  isMobile = useIsMobile()\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [openMobile, setOpenMobile] = \cf5 \strokec5 React\cf0 \strokec4 .useState(\cf2 \strokec2 false\cf0 \strokec4 )\cb1 \
\
\cb3   \cf8 \cb3 \strokec8 // This is the internal state of the sidebar.\cf0 \cb1 \strokec4 \
\cb3   \cf8 \cb3 \strokec8 // We use openProp and setOpenProp for control from outside the component.\cf0 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [_open, _setOpen] = \cf5 \strokec5 React\cf0 \strokec4 .useState(defaultOpen)\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  open = openProp ?? _open\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  setOpen = \cf5 \strokec5 React\cf0 \strokec4 .useCallback((value) => \{\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  openState = \cf2 \strokec2 typeof\cf0 \strokec4  value === \cf6 \strokec6 "function"\cf0 \strokec4  ? value(open) : value\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (setOpenProp) \{\cb1 \
\cb3       setOpenProp(openState)\cb1 \
\cb3     \} \cf2 \strokec2 else\cf0 \strokec4  \{\cb1 \
\cb3       _setOpen(openState)\cb1 \
\cb3     \}\cb1 \
\
\cb3     \cf8 \cb3 \strokec8 // This sets the cookie to keep the sidebar state.\cf0 \cb1 \strokec4 \
\cb3     document.cookie = \cf6 \strokec6 `\cf0 \strokec4 $\{\cf5 \strokec5 SIDEBAR_COOKIE_NAME\cf0 \strokec4 \}\cf6 \strokec6 =\cf0 \strokec4 $\{openState\}\cf6 \strokec6 ; path=/; max-age=\cf0 \strokec4 $\{\cf5 \strokec5 SIDEBAR_COOKIE_MAX_AGE\cf0 \strokec4 \}\cf6 \strokec6 `\cf0 \cb1 \strokec4 \
\cb3   \}, [setOpenProp, open])\cb1 \
\
\cb3   \cf8 \cb3 \strokec8 // Helper to toggle the sidebar.\cf0 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  toggleSidebar = \cf5 \strokec5 React\cf0 \strokec4 .useCallback(() => \{\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  isMobile\cb1 \
\cb3       ? setOpenMobile((open) => !open)\cb1 \
\cb3       : setOpen((open) => !open);\cb1 \
\cb3   \}, [isMobile, setOpen, setOpenMobile])\cb1 \
\
\cb3   \cf8 \cb3 \strokec8 // Adds a keyboard shortcut to toggle the sidebar.\cf0 \cb1 \strokec4 \
\cb3   \cf5 \strokec5 React\cf0 \strokec4 .useEffect(() => \{\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  handleKeyDown = (event) => \{\cb1 \
\cb3       \cf2 \strokec2 if\cf0 \strokec4  (\cb1 \
\cb3         event.key === \cf5 \strokec5 SIDEBAR_KEYBOARD_SHORTCUT\cf0 \strokec4  &&\cb1 \
\cb3         (event.metaKey || event.ctrlKey)\cb1 \
\cb3       ) \{\cb1 \
\cb3         event.preventDefault()\cb1 \
\cb3         toggleSidebar()\cb1 \
\cb3       \}\cb1 \
\cb3     \}\cb1 \
\
\cb3     window.addEventListener(\cf6 \strokec6 "keydown"\cf0 \strokec4 , handleKeyDown)\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  () => window.removeEventListener(\cf6 \strokec6 "keydown"\cf0 \strokec4 , handleKeyDown);\cb1 \
\cb3   \}, [toggleSidebar])\cb1 \
\
\cb3   \cf8 \cb3 \strokec8 // We add a state so that we can do data-state="expanded" or "collapsed".\cf0 \cb1 \strokec4 \
\cb3   \cf8 \cb3 \strokec8 // This makes it easier to style the sidebar with Tailwind classes.\cf0 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  state = open ? \cf6 \strokec6 "expanded"\cf0 \strokec4  : \cf6 \strokec6 "collapsed"\cf0 \cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  contextValue = \cf5 \strokec5 React\cf0 \strokec4 .useMemo(() => (\{\cb1 \
\cb3     state,\cb1 \
\cb3     open,\cb1 \
\cb3     setOpen,\cb1 \
\cb3     isMobile,\cb1 \
\cb3     openMobile,\cb1 \
\cb3     setOpenMobile,\cb1 \
\cb3     toggleSidebar,\cb1 \
\cb3   \}), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar])\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<\cf5 \strokec5 SidebarContext\cf0 \strokec4 .\cf5 \strokec5 Provider\cf0 \strokec4  value=\{contextValue\}>\cb1 \
\cb3       <\cf5 \strokec5 TooltipProvider\cf0 \strokec4  delayDuration=\{\cf7 \cb3 \strokec7 0\cf0 \cb3 \strokec4 \}>\cb1 \
\cb3         <div\cb1 \
\cb3           style=\{\cb1 \
\cb3             \{\cb1 \
\cb3               \cf6 \strokec6 "--sidebar-width"\cf0 \strokec4 : \cf5 \strokec5 SIDEBAR_WIDTH\cf0 \strokec4 ,\cb1 \
\cb3               \cf6 \strokec6 "--sidebar-width-icon"\cf0 \strokec4 : \cf5 \strokec5 SIDEBAR_WIDTH_ICON\cf0 \strokec4 ,\cb1 \
\cb3               ...style\cb1 \
\cb3             \}\cb1 \
\cb3           \}\cb1 \
\cb3           className=\{cn(\cb1 \
\cb3             \cf6 \strokec6 "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar"\cf0 \strokec4 ,\cb1 \
\cb3             className\cb1 \
\cb3           )\}\cb1 \
\cb3           ref=\{ref\}\cb1 \
\cb3           \{...props\}>\cb1 \
\cb3           \{children\}\cb1 \
\cb3         </div>\cb1 \
\cb3       </\cf5 \strokec5 TooltipProvider\cf0 \strokec4 >\cb1 \
\cb3     </\cf5 \strokec5 SidebarContext\cf0 \strokec4 .\cf5 \strokec5 Provider\cf0 \strokec4 >)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarProvider\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarProvider"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Sidebar\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \{\cb1 \
\cb3     side = \cf6 \strokec6 "left"\cf0 \strokec4 ,\cb1 \
\cb3     variant = \cf6 \strokec6 "sidebar"\cf0 \strokec4 ,\cb1 \
\cb3     collapsible = \cf6 \strokec6 "offcanvas"\cf0 \strokec4 ,\cb1 \
\cb3     className,\cb1 \
\cb3     children,\cb1 \
\cb3     ...props\cb1 \
\cb3   \},\cb1 \
\cb3   ref\cb1 \
\cb3 ) => \{\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  \{ isMobile, state, openMobile, setOpenMobile \} = useSidebar()\cb1 \
\
\cb3   \cf2 \strokec2 if\cf0 \strokec4  (collapsible === \cf6 \strokec6 "none"\cf0 \strokec4 ) \{\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3       (<div\cb1 \
\cb3         className=\{cn(\cb1 \
\cb3           \cf6 \strokec6 "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground"\cf0 \strokec4 ,\cb1 \
\cb3           className\cb1 \
\cb3         )\}\cb1 \
\cb3         ref=\{ref\}\cb1 \
\cb3         \{...props\}>\cb1 \
\cb3         \{children\}\cb1 \
\cb3       </div>)\cb1 \
\cb3     );\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf2 \strokec2 if\cf0 \strokec4  (isMobile) \{\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3       (<\cf5 \strokec5 Sheet\cf0 \strokec4  open=\{openMobile\} onOpenChange=\{setOpenMobile\} \{...props\}>\cb1 \
\cb3         <\cf5 \strokec5 SheetContent\cf0 \cb1 \strokec4 \
\cb3           data-sidebar=\cf6 \strokec6 "sidebar"\cf0 \cb1 \strokec4 \
\cb3           data-mobile=\cf6 \strokec6 "true"\cf0 \cb1 \strokec4 \
\cb3           className=\cf6 \strokec6 "w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"\cf0 \cb1 \strokec4 \
\cb3           style=\{\cb1 \
\cb3             \{\cb1 \
\cb3               \cf6 \strokec6 "--sidebar-width"\cf0 \strokec4 : \cf5 \strokec5 SIDEBAR_WIDTH_MOBILE\cf0 \cb1 \strokec4 \
\cb3             \}\cb1 \
\cb3           \}\cb1 \
\cb3           side=\{side\}>\cb1 \
\cb3           <div className=\cf6 \strokec6 "flex h-full w-full flex-col"\cf0 \strokec4 >\{children\}</div>\cb1 \
\cb3         </\cf5 \strokec5 SheetContent\cf0 \strokec4 >\cb1 \
\cb3       </\cf5 \strokec5 Sheet\cf0 \strokec4 >)\cb1 \
\cb3     );\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<div\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\cf6 \strokec6 "group peer hidden text-sidebar-foreground md:block"\cf0 \cb1 \strokec4 \
\cb3       data-state=\{state\}\cb1 \
\cb3       data-collapsible=\{state === \cf6 \strokec6 "collapsed"\cf0 \strokec4  ? collapsible : \cf6 \strokec6 ""\cf0 \strokec4 \}\cb1 \
\cb3       data-variant=\{variant\}\cb1 \
\cb3       data-side=\{side\}>\cb1 \
\cb3       \{\cf8 \cb3 \strokec8 /* This is what handles the sidebar gap on desktop */\cf0 \cb3 \strokec4 \}\cb1 \
\cb3       <div\cb1 \
\cb3         className=\{cn(\cb1 \
\cb3           \cf6 \strokec6 "relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear"\cf0 \strokec4 ,\cb1 \
\cb3           \cf6 \strokec6 "group-data-[collapsible=offcanvas]:w-0"\cf0 \strokec4 ,\cb1 \
\cb3           \cf6 \strokec6 "group-data-[side=right]:rotate-180"\cf0 \strokec4 ,\cb1 \
\cb3           variant === \cf6 \strokec6 "floating"\cf0 \strokec4  || variant === \cf6 \strokec6 "inset"\cf0 \cb1 \strokec4 \
\cb3             ? \cf6 \strokec6 "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"\cf0 \cb1 \strokec4 \
\cb3             : \cf6 \strokec6 "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"\cf0 \cb1 \strokec4 \
\cb3         )\} />\cb1 \
\cb3       <div\cb1 \
\cb3         className=\{cn(\cb1 \
\cb3           \cf6 \strokec6 "fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex"\cf0 \strokec4 ,\cb1 \
\cb3           side === \cf6 \strokec6 "left"\cf0 \cb1 \strokec4 \
\cb3             ? \cf6 \strokec6 "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"\cf0 \cb1 \strokec4 \
\cb3             : \cf6 \strokec6 "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]"\cf0 \strokec4 ,\cb1 \
\cb3           \cf8 \cb3 \strokec8 // Adjust the padding for floating and inset variants.\cf0 \cb1 \strokec4 \
\cb3           variant === \cf6 \strokec6 "floating"\cf0 \strokec4  || variant === \cf6 \strokec6 "inset"\cf0 \cb1 \strokec4 \
\cb3             ? \cf6 \strokec6 "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"\cf0 \cb1 \strokec4 \
\cb3             : \cf6 \strokec6 "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l"\cf0 \strokec4 ,\cb1 \
\cb3           className\cb1 \
\cb3         )\}\cb1 \
\cb3         \{...props\}>\cb1 \
\cb3         <div\cb1 \
\cb3           data-sidebar=\cf6 \strokec6 "sidebar"\cf0 \cb1 \strokec4 \
\cb3           className=\cf6 \strokec6 "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"\cf0 \strokec4 >\cb1 \
\cb3           \{children\}\cb1 \
\cb3         </div>\cb1 \
\cb3       </div>\cb1 \
\cb3     </div>)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 Sidebar\cf0 \strokec4 .displayName = \cf6 \strokec6 "Sidebar"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarTrigger\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, onClick, asChild = \cf2 \strokec2 false\cf0 \strokec4 , ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  \{ toggleSidebar \} = useSidebar()\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<\cf5 \strokec5 Button\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "trigger"\cf0 \cb1 \strokec4 \
\cb3       variant=\cf6 \strokec6 "ghost"\cf0 \cb1 \strokec4 \
\cb3       size=\cf6 \strokec6 "icon"\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cf6 \strokec6 "h-7 w-7"\cf0 \strokec4 , className)\}\cb1 \
\cb3       onClick=\{(event) => \{\cb1 \
\cb3         onClick?.(event)\cb1 \
\cb3         toggleSidebar()\cb1 \
\cb3       \}\}\cb1 \
\cb3       asChild=\{asChild\}\cb1 \
\cb3       \{...props\}>\cb1 \
\cb3       \{asChild ? (\cb1 \
\cb3         <\cf5 \strokec5 PanelLeft\cf0 \strokec4  />\cb1 \
\cb3       ) : (\cb1 \
\cb3         <>\cb1 \
\cb3           <\cf5 \strokec5 PanelLeft\cf0 \strokec4  />\cb1 \
\cb3           <span className=\cf6 \strokec6 "sr-only"\cf0 \strokec4 >\cf5 \strokec5 Toggle\cf0 \strokec4  \cf5 \strokec5 Sidebar\cf0 \strokec4 </span>\cb1 \
\cb3         </>\cb1 \
\cb3       )\}\cb1 \
\cb3     </\cf5 \strokec5 Button\cf0 \strokec4 >)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarTrigger\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarTrigger"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarRail\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  \{ toggleSidebar \} = useSidebar()\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<button\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "rail"\cf0 \cb1 \strokec4 \
\cb3       aria-label=\cf6 \strokec6 "Toggle Sidebar"\cf0 \cb1 \strokec4 \
\cb3       tabIndex=\{-\cf7 \cb3 \strokec7 1\cf0 \cb3 \strokec4 \}\cb1 \
\cb3       onClick=\{toggleSidebar\}\cb1 \
\cb3       title=\cf6 \strokec6 "Toggle Sidebar"\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex"\cf0 \strokec4 ,\cb1 \
\cb3         \cf6 \strokec6 "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize"\cf0 \strokec4 ,\cb1 \
\cb3         \cf6 \strokec6 "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize"\cf0 \strokec4 ,\cb1 \
\cb3         \cf6 \strokec6 "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar"\cf0 \strokec4 ,\cb1 \
\cb3         \cf6 \strokec6 "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2"\cf0 \strokec4 ,\cb1 \
\cb3         \cf6 \strokec6 "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarRail\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarRail"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarInset\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<main\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "relative flex min-h-svh flex-1 flex-col bg-background"\cf0 \strokec4 ,\cb1 \
\cb3         \cf6 \strokec6 "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarInset\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarInset"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarInput\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<\cf5 \strokec5 Input\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "input"\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarInput\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarInput"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarHeader\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<div\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "header"\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cf6 \strokec6 "flex flex-col gap-2 p-2"\cf0 \strokec4 , className)\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarHeader\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarHeader"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarFooter\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<div\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "footer"\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cf6 \strokec6 "flex flex-col gap-2 p-2"\cf0 \strokec4 , className)\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarFooter\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarFooter"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarSeparator\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<\cf5 \strokec5 Separator\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "separator"\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cf6 \strokec6 "mx-2 w-auto bg-sidebar-border"\cf0 \strokec4 , className)\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarSeparator\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarSeparator"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarContent\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<div\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "content"\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarContent\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarContent"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarGroup\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<div\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "group"\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cf6 \strokec6 "relative flex w-full min-w-0 flex-col p-2"\cf0 \strokec4 , className)\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarGroup\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarGroup"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarGroupLabel\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, asChild = \cf2 \strokec2 false\cf0 \strokec4 , ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Comp\cf0 \strokec4  = asChild ? \cf5 \strokec5 Slot\cf0 \strokec4  : \cf6 \strokec6 "div"\cf0 \cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<\cf5 \strokec5 Comp\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "group-label"\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"\cf0 \strokec4 ,\cb1 \
\cb3         \cf6 \strokec6 "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarGroupLabel\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarGroupLabel"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarGroupAction\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, asChild = \cf2 \strokec2 false\cf0 \strokec4 , ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Comp\cf0 \strokec4  = asChild ? \cf5 \strokec5 Slot\cf0 \strokec4  : \cf6 \strokec6 "button"\cf0 \cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<\cf5 \strokec5 Comp\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "group-action"\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"\cf0 \strokec4 ,\cb1 \
\cb3         \cf8 \cb3 \strokec8 // Increases the hit area of the button on mobile.\cf0 \cb1 \strokec4 \
\cb3         \cf6 \strokec6 "after:absolute after:-inset-2 after:md:hidden"\cf0 \strokec4 ,\cb1 \
\cb3         \cf6 \strokec6 "group-data-[collapsible=icon]:hidden"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarGroupAction\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarGroupAction"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarGroupContent\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     data-sidebar=\cf6 \strokec6 "group-content"\cf0 \cb1 \strokec4 \
\cb3     className=\{cn(\cf6 \strokec6 "w-full text-sm"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarGroupContent\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarGroupContent"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarMenu\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <ul\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     data-sidebar=\cf6 \strokec6 "menu"\cf0 \cb1 \strokec4 \
\cb3     className=\{cn(\cf6 \strokec6 "flex w-full min-w-0 flex-col gap-1"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarMenu\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarMenu"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarMenuItem\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <li\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     data-sidebar=\cf6 \strokec6 "menu-item"\cf0 \cb1 \strokec4 \
\cb3     className=\{cn(\cf6 \strokec6 "group/menu-item relative"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarMenuItem\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarMenuItem"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  sidebarMenuButtonVariants = cva(\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0"\cf0 \strokec4 ,\cb1 \
\cb3   \{\cb1 \
\cb3     variants: \{\cb1 \
\cb3       variant: \{\cb1 \
\cb3         \cf2 \strokec2 default\cf0 \strokec4 : \cf6 \strokec6 "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"\cf0 \strokec4 ,\cb1 \
\cb3         outline:\cb1 \
\cb3           \cf6 \strokec6 "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"\cf0 \strokec4 ,\cb1 \
\cb3       \},\cb1 \
\cb3       size: \{\cb1 \
\cb3         \cf2 \strokec2 default\cf0 \strokec4 : \cf6 \strokec6 "h-8 text-sm"\cf0 \strokec4 ,\cb1 \
\cb3         sm: \cf6 \strokec6 "h-7 text-xs"\cf0 \strokec4 ,\cb1 \
\cb3         lg: \cf6 \strokec6 "h-12 text-sm group-data-[collapsible=icon]:!p-0"\cf0 \strokec4 ,\cb1 \
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
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarMenuButton\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \{\cb1 \
\cb3     asChild = \cf2 \strokec2 false\cf0 \strokec4 ,\cb1 \
\cb3     isActive = \cf2 \strokec2 false\cf0 \strokec4 ,\cb1 \
\cb3     variant = \cf6 \strokec6 "default"\cf0 \strokec4 ,\cb1 \
\cb3     size = \cf6 \strokec6 "default"\cf0 \strokec4 ,\cb1 \
\cb3     tooltip,\cb1 \
\cb3     className,\cb1 \
\cb3     ...props\cb1 \
\cb3   \},\cb1 \
\cb3   ref\cb1 \
\cb3 ) => \{\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Comp\cf0 \strokec4  = asChild ? \cf5 \strokec5 Slot\cf0 \strokec4  : \cf6 \strokec6 "button"\cf0 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  \{ isMobile, state \} = useSidebar()\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  button = (\cb1 \
\cb3     <\cf5 \strokec5 Comp\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "menu-button"\cf0 \cb1 \strokec4 \
\cb3       data-size=\{size\}\cb1 \
\cb3       data-active=\{isActive\}\cb1 \
\cb3       className=\{cn(sidebarMenuButtonVariants(\{ variant, size \}), className)\}\cb1 \
\cb3       \{...props\} />\cb1 \
\cb3   )\cb1 \
\
\cb3   \cf2 \strokec2 if\cf0 \strokec4  (!tooltip) \{\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  button\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf2 \strokec2 if\cf0 \strokec4  (\cf2 \strokec2 typeof\cf0 \strokec4  tooltip === \cf6 \strokec6 "string"\cf0 \strokec4 ) \{\cb1 \
\cb3     tooltip = \{\cb1 \
\cb3       children: tooltip,\cb1 \
\cb3     \}\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<\cf5 \strokec5 Tooltip\cf0 \strokec4 >\cb1 \
\cb3       <\cf5 \strokec5 TooltipTrigger\cf0 \strokec4  asChild>\{button\}</\cf5 \strokec5 TooltipTrigger\cf0 \strokec4 >\cb1 \
\cb3       <\cf5 \strokec5 TooltipContent\cf0 \cb1 \strokec4 \
\cb3         side=\cf6 \strokec6 "right"\cf0 \cb1 \strokec4 \
\cb3         align=\cf6 \strokec6 "center"\cf0 \cb1 \strokec4 \
\cb3         hidden=\{state !== \cf6 \strokec6 "collapsed"\cf0 \strokec4  || isMobile\}\cb1 \
\cb3         \{...tooltip\} />\cb1 \
\cb3     </\cf5 \strokec5 Tooltip\cf0 \strokec4 >)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarMenuButton\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarMenuButton"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarMenuAction\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, asChild = \cf2 \strokec2 false\cf0 \strokec4 , showOnHover = \cf2 \strokec2 false\cf0 \strokec4 , ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Comp\cf0 \strokec4  = asChild ? \cf5 \strokec5 Slot\cf0 \strokec4  : \cf6 \strokec6 "button"\cf0 \cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<\cf5 \strokec5 Comp\cf0 \cb1 \strokec4 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "menu-action"\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0"\cf0 \strokec4 ,\cb1 \
\cb3         \cf8 \cb3 \strokec8 // Increases the hit area of the button on mobile.\cf0 \cb1 \strokec4 \
\cb3         \cf6 \strokec6 "after:absolute after:-inset-2 after:md:hidden"\cf0 \strokec4 ,\cb1 \
\cb3         \cf6 \strokec6 "peer-data-[size=sm]/menu-button:top-1"\cf0 \strokec4 ,\cb1 \
\cb3         \cf6 \strokec6 "peer-data-[size=default]/menu-button:top-1.5"\cf0 \strokec4 ,\cb1 \
\cb3         \cf6 \strokec6 "peer-data-[size=lg]/menu-button:top-2.5"\cf0 \strokec4 ,\cb1 \
\cb3         \cf6 \strokec6 "group-data-[collapsible=icon]:hidden"\cf0 \strokec4 ,\cb1 \
\cb3         showOnHover &&\cb1 \
\cb3         \cf6 \strokec6 "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarMenuAction\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarMenuAction"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarMenuBadge\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     data-sidebar=\cf6 \strokec6 "menu-badge"\cf0 \cb1 \strokec4 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground"\cf0 \strokec4 ,\cb1 \
\cb3       \cf6 \strokec6 "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground"\cf0 \strokec4 ,\cb1 \
\cb3       \cf6 \strokec6 "peer-data-[size=sm]/menu-button:top-1"\cf0 \strokec4 ,\cb1 \
\cb3       \cf6 \strokec6 "peer-data-[size=default]/menu-button:top-1.5"\cf0 \strokec4 ,\cb1 \
\cb3       \cf6 \strokec6 "peer-data-[size=lg]/menu-button:top-2.5"\cf0 \strokec4 ,\cb1 \
\cb3       \cf6 \strokec6 "group-data-[collapsible=icon]:hidden"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarMenuBadge\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarMenuBadge"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarMenuSkeleton\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, showIcon = \cf2 \strokec2 false\cf0 \strokec4 , ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf8 \cb3 \strokec8 // Random width between 50 to 90%.\cf0 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  width = \cf5 \strokec5 React\cf0 \strokec4 .useMemo(() => \{\cb1 \
\cb3     \cf2 \strokec2 return\cf0 \strokec4  \cf6 \strokec6 `\cf0 \strokec4 $\{\cf5 \strokec5 Math\cf0 \strokec4 .floor(\cf5 \strokec5 Math\cf0 \strokec4 .random() * \cf7 \cb3 \strokec7 40\cf0 \cb3 \strokec4 ) + \cf7 \cb3 \strokec7 50\cf0 \cb3 \strokec4 \}\cf6 \strokec6 %`\cf0 \strokec4 ;\cb1 \
\cb3   \}, [])\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<div\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       data-sidebar=\cf6 \strokec6 "menu-skeleton"\cf0 \cb1 \strokec4 \
\cb3       className=\{cn(\cf6 \strokec6 "flex h-8 items-center gap-2 rounded-md px-2"\cf0 \strokec4 , className)\}\cb1 \
\cb3       \{...props\}>\cb1 \
\cb3       \{showIcon && (\cb1 \
\cb3         <\cf5 \strokec5 Skeleton\cf0 \strokec4  className=\cf6 \strokec6 "size-4 rounded-md"\cf0 \strokec4  data-sidebar=\cf6 \strokec6 "menu-skeleton-icon"\cf0 \strokec4  />\cb1 \
\cb3       )\}\cb1 \
\cb3       <\cf5 \strokec5 Skeleton\cf0 \cb1 \strokec4 \
\cb3         className=\cf6 \strokec6 "h-4 max-w-[--skeleton-width] flex-1"\cf0 \cb1 \strokec4 \
\cb3         data-sidebar=\cf6 \strokec6 "menu-skeleton-text"\cf0 \cb1 \strokec4 \
\cb3         style=\{\cb1 \
\cb3           \{\cb1 \
\cb3             \cf6 \strokec6 "--skeleton-width"\cf0 \strokec4 : width\cb1 \
\cb3           \}\cb1 \
\cb3         \} />\cb1 \
\cb3     </div>)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarMenuSkeleton\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarMenuSkeleton"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarMenuSub\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <ul\cb1 \
\cb3     ref=\{ref\}\cb1 \
\cb3     data-sidebar=\cf6 \strokec6 "menu-sub"\cf0 \cb1 \strokec4 \
\cb3     className=\{cn(\cb1 \
\cb3       \cf6 \strokec6 "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5"\cf0 \strokec4 ,\cb1 \
\cb3       \cf6 \strokec6 "group-data-[collapsible=icon]:hidden"\cf0 \strokec4 ,\cb1 \
\cb3       className\cb1 \
\cb3     )\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarMenuSub\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarMenuSub"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarMenuSubItem\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ ...props \}, ref) => <li ref=\{ref\} \{...props\} />)\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarMenuSubItem\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarMenuSubItem"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 SidebarMenuSubButton\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef(\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   (\{ asChild = \cf2 \strokec2 false\cf0 \strokec4 , size = \cf6 \strokec6 "md"\cf0 \strokec4 , isActive, className, ...props \}, ref) => \{\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 Comp\cf0 \strokec4  = asChild ? \cf5 \strokec5 Slot\cf0 \strokec4  : \cf6 \strokec6 "a"\cf0 \cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3       (<\cf5 \strokec5 Comp\cf0 \cb1 \strokec4 \
\cb3         ref=\{ref\}\cb1 \
\cb3         data-sidebar=\cf6 \strokec6 "menu-sub-button"\cf0 \cb1 \strokec4 \
\cb3         data-size=\{size\}\cb1 \
\cb3         data-active=\{isActive\}\cb1 \
\cb3         className=\{cn(\cb1 \
\cb3           \cf6 \strokec6 "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground"\cf0 \strokec4 ,\cb1 \
\cb3           \cf6 \strokec6 "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"\cf0 \strokec4 ,\cb1 \
\cb3           size === \cf6 \strokec6 "sm"\cf0 \strokec4  && \cf6 \strokec6 "text-xs"\cf0 \strokec4 ,\cb1 \
\cb3           size === \cf6 \strokec6 "md"\cf0 \strokec4  && \cf6 \strokec6 "text-sm"\cf0 \strokec4 ,\cb1 \
\cb3           \cf6 \strokec6 "group-data-[collapsible=icon]:hidden"\cf0 \strokec4 ,\cb1 \
\cb3           className\cb1 \
\cb3         )\}\cb1 \
\cb3         \{...props\} />)\cb1 \
\cb3     );\cb1 \
\cb3   \}\cb1 \
\cb3 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 SidebarMenuSubButton\cf0 \strokec4 .displayName = \cf6 \strokec6 "SidebarMenuSubButton"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 Sidebar\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarFooter\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarGroup\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarGroupAction\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarGroupContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarGroupLabel\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarHeader\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarInput\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarInset\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarMenu\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarMenuAction\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarMenuBadge\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarMenuButton\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarMenuItem\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarMenuSkeleton\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarMenuSub\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarMenuSubButton\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarMenuSubItem\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarProvider\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarRail\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarSeparator\cf0 \strokec4 ,\cb1 \
\cb3   \cf5 \strokec5 SidebarTrigger\cf0 \strokec4 ,\cb1 \
\cb3   useSidebar,\cb1 \
\cb3 \}\cb1 \
\
}