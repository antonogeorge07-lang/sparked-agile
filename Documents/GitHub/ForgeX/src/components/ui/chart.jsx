{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red144\green1\blue18;\red255\green255\blue254;\red0\green0\blue0;
\red0\green0\blue255;\red14\green110\blue109;\red15\green112\blue1;\red107\green0\blue1;\red19\green118\blue70;
}
{\*\expandedcolortbl;;\cssrgb\c63922\c8235\c8235;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c0\c100000;\cssrgb\c0\c50196\c50196;\cssrgb\c0\c50196\c0;\cssrgb\c50196\c0\c0;\cssrgb\c3529\c52549\c34510;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 "use client"\cf0 \strokec4 ;\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 React\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "react"\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf0 \strokec4  * as \cf6 \strokec6 RechartsPrimitive\cf0 \strokec4  \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "recharts"\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ cn \} \cf5 \strokec5 from\cf0 \strokec4  \cf2 \strokec2 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 // Format: \{ THEME_NAME: CSS_SELECTOR \}\cf0 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 THEMES\cf0 \strokec4  = \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   light: \cf2 \strokec2 ""\cf0 \strokec4 ,\cb1 \
\cb3   dark: \cf2 \strokec2 ".dark"\cf0 \cb1 \strokec4 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ChartContext\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .createContext(\cf5 \strokec5 null\cf0 \strokec4 )\cb1 \
\
\cf5 \cb3 \strokec5 function\cf0 \strokec4  useChart() \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 const\cf0 \strokec4  context = \cf6 \strokec6 React\cf0 \strokec4 .useContext(\cf6 \strokec6 ChartContext\cf0 \strokec4 )\cb1 \
\
\cb3   \cf5 \strokec5 if\cf0 \strokec4  (!context) \{\cb1 \
\cb3     \cf5 \strokec5 throw\cf0 \strokec4  \cf5 \strokec5 new\cf0 \strokec4  \cf6 \strokec6 Error\cf0 \strokec4 (\cf2 \strokec2 "useChart must be used within a <ChartContainer />"\cf0 \strokec4 )\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf5 \strokec5 return\cf0 \strokec4  context\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ChartContainer\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\{ id, className, children, config, ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 const\cf0 \strokec4  uniqueId = \cf6 \strokec6 React\cf0 \strokec4 .useId()\cb1 \
\cb3   \cf5 \strokec5 const\cf0 \strokec4  chartId = \cf2 \strokec2 `chart-\cf0 \strokec4 $\{id || uniqueId.replace(\cf8 \cb3 \strokec8 /:/\cf5 \cb3 \strokec5 g\cf0 \strokec4 , \cf2 \strokec2 ""\cf0 \strokec4 )\}\cf2 \strokec2 `\cf0 \cb1 \strokec4 \
\
\cb3   \cf5 \strokec5 return\cf0 \strokec4  (\cb1 \
\cb3     (<\cf6 \strokec6 ChartContext\cf0 \strokec4 .\cf6 \strokec6 Provider\cf0 \strokec4  value=\{\{ config \}\}>\cb1 \
\cb3       <div\cb1 \
\cb3         data-chart=\{chartId\}\cb1 \
\cb3         ref=\{ref\}\cb1 \
\cb3         className=\{cn(\cb1 \
\cb3           \cf2 \strokec2 "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none"\cf0 \strokec4 ,\cb1 \
\cb3           className\cb1 \
\cb3         )\}\cb1 \
\cb3         \{...props\}>\cb1 \
\cb3         <\cf6 \strokec6 ChartStyle\cf0 \strokec4  id=\{chartId\} config=\{config\} />\cb1 \
\cb3         <\cf6 \strokec6 RechartsPrimitive\cf0 \strokec4 .\cf6 \strokec6 ResponsiveContainer\cf0 \strokec4 >\cb1 \
\cb3           \{children\}\cb1 \
\cb3         </\cf6 \strokec6 RechartsPrimitive\cf0 \strokec4 .\cf6 \strokec6 ResponsiveContainer\cf0 \strokec4 >\cb1 \
\cb3       </div>\cb1 \
\cb3     </\cf6 \strokec6 ChartContext\cf0 \strokec4 .\cf6 \strokec6 Provider\cf0 \strokec4 >)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 ChartContainer\cf0 \strokec4 .displayName = \cf2 \strokec2 "Chart"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ChartStyle\cf0 \strokec4  = (\{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   id,\cb1 \
\cb3   config\cb1 \
\cb3 \}) => \{\cb1 \
\cb3   \cf5 \strokec5 const\cf0 \strokec4  colorConfig = \cf6 \strokec6 Object\cf0 \strokec4 .entries(config).filter(([, config]) => config.theme || config.color)\cb1 \
\
\cb3   \cf5 \strokec5 if\cf0 \strokec4  (!colorConfig.length) \{\cb1 \
\cb3     \cf5 \strokec5 return\cf0 \strokec4  \cf5 \strokec5 null\cf0 \cb1 \strokec4 \
\cb3   \}\cb1 \
\
\cb3   \cf5 \strokec5 return\cf0 \strokec4  (\cb1 \
\cb3     (<style\cb1 \
\cb3       dangerouslySetInnerHTML=\{\{\cb1 \
\cb3         __html: \cf6 \strokec6 Object\cf0 \strokec4 .entries(\cf6 \strokec6 THEMES\cf0 \strokec4 )\cb1 \
\cb3           .map(([theme, prefix]) => \cf2 \strokec2 `\cf0 \cb1 \strokec4 \
\cb3 $\{prefix\}\cf2 \strokec2  [data-chart=\cf0 \strokec4 $\{id\}\cf2 \strokec2 ] \{\cf0 \cb1 \strokec4 \
\cb3 $\{colorConfig\cb1 \
\cb3 .map(([key, itemConfig]) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  color =\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   itemConfig.theme?.[theme] ||\cb1 \
\cb3   itemConfig.color\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 return\cf0 \strokec4  color ? \cf2 \strokec2 `  --color-\cf0 \strokec4 $\{key\}\cf2 \strokec2 : \cf0 \strokec4 $\{color\}\cf2 \strokec2 ;`\cf0 \strokec4  : \cf5 \strokec5 null\cf0 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3 \})\cb1 \
\cb3 .join(\cf2 \strokec2 "\\n"\cf0 \strokec4 )\}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 \}\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 `\cf0 \strokec4 )\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3           .join(\cf2 \strokec2 "\\n"\cf0 \strokec4 ),\cb1 \
\cb3       \}\} />)\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ChartTooltip\cf0 \strokec4  = \cf6 \strokec6 RechartsPrimitive\cf0 \strokec4 .\cf6 \strokec6 Tooltip\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ChartTooltipContent\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \{\cb1 \
\cb3     active,\cb1 \
\cb3     payload,\cb1 \
\cb3     className,\cb1 \
\cb3     indicator = \cf2 \strokec2 "dot"\cf0 \strokec4 ,\cb1 \
\cb3     hideLabel = \cf5 \strokec5 false\cf0 \strokec4 ,\cb1 \
\cb3     hideIndicator = \cf5 \strokec5 false\cf0 \strokec4 ,\cb1 \
\cb3     label,\cb1 \
\cb3     labelFormatter,\cb1 \
\cb3     labelClassName,\cb1 \
\cb3     formatter,\cb1 \
\cb3     color,\cb1 \
\cb3     nameKey,\cb1 \
\cb3     labelKey,\cb1 \
\cb3   \},\cb1 \
\cb3   ref\cb1 \
\cb3 ) => \{\cb1 \
\cb3   \cf5 \strokec5 const\cf0 \strokec4  \{ config \} = useChart()\cb1 \
\
\cb3   \cf5 \strokec5 const\cf0 \strokec4  tooltipLabel = \cf6 \strokec6 React\cf0 \strokec4 .useMemo(() => \{\cb1 \
\cb3     \cf5 \strokec5 if\cf0 \strokec4  (hideLabel || !payload?.length) \{\cb1 \
\cb3       \cf5 \strokec5 return\cf0 \strokec4  \cf5 \strokec5 null\cf0 \cb1 \strokec4 \
\cb3     \}\cb1 \
\
\cb3     \cf5 \strokec5 const\cf0 \strokec4  [item] = payload\cb1 \
\cb3     \cf5 \strokec5 const\cf0 \strokec4  key = \cf2 \strokec2 `\cf0 \strokec4 $\{labelKey || item.dataKey || item.name || \cf2 \strokec2 "value"\cf0 \strokec4 \}\cf2 \strokec2 `\cf0 \cb1 \strokec4 \
\cb3     \cf5 \strokec5 const\cf0 \strokec4  itemConfig = getPayloadConfigFromPayload(config, item, key)\cb1 \
\cb3     \cf5 \strokec5 const\cf0 \strokec4  value =\cb1 \
\cb3       !labelKey && \cf5 \strokec5 typeof\cf0 \strokec4  label === \cf2 \strokec2 "string"\cf0 \cb1 \strokec4 \
\cb3         ? config[label]?.label || label\cb1 \
\cb3         : itemConfig?.label\cb1 \
\
\cb3     \cf5 \strokec5 if\cf0 \strokec4  (labelFormatter) \{\cb1 \
\cb3       \cf5 \strokec5 return\cf0 \strokec4  (\cb1 \
\cb3         (<div className=\{cn(\cf2 \strokec2 "font-medium"\cf0 \strokec4 , labelClassName)\}>\cb1 \
\cb3           \{labelFormatter(value, payload)\}\cb1 \
\cb3         </div>)\cb1 \
\cb3       );\cb1 \
\cb3     \}\cb1 \
\
\cb3     \cf5 \strokec5 if\cf0 \strokec4  (!value) \{\cb1 \
\cb3       \cf5 \strokec5 return\cf0 \strokec4  \cf5 \strokec5 null\cf0 \cb1 \strokec4 \
\cb3     \}\cb1 \
\
\cb3     \cf5 \strokec5 return\cf0 \strokec4  <div className=\{cn(\cf2 \strokec2 "font-medium"\cf0 \strokec4 , labelClassName)\}>\{value\}</div>;\cb1 \
\cb3   \}, [\cb1 \
\cb3     label,\cb1 \
\cb3     labelFormatter,\cb1 \
\cb3     payload,\cb1 \
\cb3     hideLabel,\cb1 \
\cb3     labelClassName,\cb1 \
\cb3     config,\cb1 \
\cb3     labelKey,\cb1 \
\cb3   ])\cb1 \
\
\cb3   \cf5 \strokec5 if\cf0 \strokec4  (!active || !payload?.length) \{\cb1 \
\cb3     \cf5 \strokec5 return\cf0 \strokec4  \cf5 \strokec5 null\cf0 \cb1 \strokec4 \
\cb3   \}\cb1 \
\
\cb3   \cf5 \strokec5 const\cf0 \strokec4  nestLabel = payload.length === \cf9 \cb3 \strokec9 1\cf0 \cb3 \strokec4  && indicator !== \cf2 \strokec2 "dot"\cf0 \cb1 \strokec4 \
\
\cb3   \cf5 \strokec5 return\cf0 \strokec4  (\cb1 \
\cb3     (<div\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf2 \strokec2 "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}>\cb1 \
\cb3       \{!nestLabel ? tooltipLabel : \cf5 \strokec5 null\cf0 \strokec4 \}\cb1 \
\cb3       <div className=\cf2 \strokec2 "grid gap-1.5"\cf0 \strokec4 >\cb1 \
\cb3         \{payload.map((item, index) => \{\cb1 \
\cb3           \cf5 \strokec5 const\cf0 \strokec4  key = \cf2 \strokec2 `\cf0 \strokec4 $\{nameKey || item.name || item.dataKey || \cf2 \strokec2 "value"\cf0 \strokec4 \}\cf2 \strokec2 `\cf0 \cb1 \strokec4 \
\cb3           \cf5 \strokec5 const\cf0 \strokec4  itemConfig = getPayloadConfigFromPayload(config, item, key)\cb1 \
\cb3           \cf5 \strokec5 const\cf0 \strokec4  indicatorColor = color || item.payload.fill || item.color\cb1 \
\
\cb3           \cf5 \strokec5 return\cf0 \strokec4  (\cb1 \
\cb3             (<div\cb1 \
\cb3               key=\{item.dataKey\}\cb1 \
\cb3               className=\{cn(\cb1 \
\cb3                 \cf2 \strokec2 "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"\cf0 \strokec4 ,\cb1 \
\cb3                 indicator === \cf2 \strokec2 "dot"\cf0 \strokec4  && \cf2 \strokec2 "items-center"\cf0 \cb1 \strokec4 \
\cb3               )\}>\cb1 \
\cb3               \{formatter && item?.value !== \cf5 \strokec5 undefined\cf0 \strokec4  && item.name ? (\cb1 \
\cb3                 formatter(item.value, item.name, item, index, item.payload)\cb1 \
\cb3               ) : (\cb1 \
\cb3                 <>\cb1 \
\cb3                   \{itemConfig?.icon ? (\cb1 \
\cb3                     <itemConfig.icon />\cb1 \
\cb3                   ) : (\cb1 \
\cb3                     !hideIndicator && (\cb1 \
\cb3                       <div\cb1 \
\cb3                         className=\{cn(\cf2 \strokec2 "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"\cf0 \strokec4 , \{\cb1 \
\cb3                           \cf2 \strokec2 "h-2.5 w-2.5"\cf0 \strokec4 : indicator === \cf2 \strokec2 "dot"\cf0 \strokec4 ,\cb1 \
\cb3                           \cf2 \strokec2 "w-1"\cf0 \strokec4 : indicator === \cf2 \strokec2 "line"\cf0 \strokec4 ,\cb1 \
\cb3                           \cf2 \strokec2 "w-0 border-[1.5px] border-dashed bg-transparent"\cf0 \strokec4 :\cb1 \
\cb3                             indicator === \cf2 \strokec2 "dashed"\cf0 \strokec4 ,\cb1 \
\cb3                           \cf2 \strokec2 "my-0.5"\cf0 \strokec4 : nestLabel && indicator === \cf2 \strokec2 "dashed"\cf0 \strokec4 ,\cb1 \
\cb3                         \})\}\cb1 \
\cb3                         style=\{\cb1 \
\cb3                           \{\cb1 \
\cb3                             \cf2 \strokec2 "--color-bg"\cf0 \strokec4 : indicatorColor,\cb1 \
\cb3                             \cf2 \strokec2 "--color-border"\cf0 \strokec4 : indicatorColor\cb1 \
\cb3                           \}\cb1 \
\cb3                         \} />\cb1 \
\cb3                     )\cb1 \
\cb3                   )\}\cb1 \
\cb3                   <div\cb1 \
\cb3                     className=\{cn(\cb1 \
\cb3                       \cf2 \strokec2 "flex flex-1 justify-between leading-none"\cf0 \strokec4 ,\cb1 \
\cb3                       nestLabel ? \cf2 \strokec2 "items-end"\cf0 \strokec4  : \cf2 \strokec2 "items-center"\cf0 \cb1 \strokec4 \
\cb3                     )\}>\cb1 \
\cb3                     <div className=\cf2 \strokec2 "grid gap-1.5"\cf0 \strokec4 >\cb1 \
\cb3                       \{nestLabel ? tooltipLabel : \cf5 \strokec5 null\cf0 \strokec4 \}\cb1 \
\cb3                       <span className=\cf2 \strokec2 "text-muted-foreground"\cf0 \strokec4 >\cb1 \
\cb3                         \{itemConfig?.label || item.name\}\cb1 \
\cb3                       </span>\cb1 \
\cb3                     </div>\cb1 \
\cb3                     \{item.value && (\cb1 \
\cb3                       <span className=\cf2 \strokec2 "font-mono font-medium tabular-nums text-foreground"\cf0 \strokec4 >\cb1 \
\cb3                         \{item.value.toLocaleString()\}\cb1 \
\cb3                       </span>\cb1 \
\cb3                     )\}\cb1 \
\cb3                   </div>\cb1 \
\cb3                 </>\cb1 \
\cb3               )\}\cb1 \
\cb3             </div>)\cb1 \
\cb3           );\cb1 \
\cb3         \})\}\cb1 \
\cb3       </div>\cb1 \
\cb3     </div>)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 ChartTooltipContent\cf0 \strokec4 .displayName = \cf2 \strokec2 "ChartTooltip"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ChartLegend\cf0 \strokec4  = \cf6 \strokec6 RechartsPrimitive\cf0 \strokec4 .\cf6 \strokec6 Legend\cf0 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf6 \strokec6 ChartLegendContent\cf0 \strokec4  = \cf6 \strokec6 React\cf0 \strokec4 .forwardRef((\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \{ className, hideIcon = \cf5 \strokec5 false\cf0 \strokec4 , payload, verticalAlign = \cf2 \strokec2 "bottom"\cf0 \strokec4 , nameKey \},\cb1 \
\cb3   ref\cb1 \
\cb3 ) => \{\cb1 \
\cb3   \cf5 \strokec5 const\cf0 \strokec4  \{ config \} = useChart()\cb1 \
\
\cb3   \cf5 \strokec5 if\cf0 \strokec4  (!payload?.length) \{\cb1 \
\cb3     \cf5 \strokec5 return\cf0 \strokec4  \cf5 \strokec5 null\cf0 \cb1 \strokec4 \
\cb3   \}\cb1 \
\
\cb3   \cf5 \strokec5 return\cf0 \strokec4  (\cb1 \
\cb3     (<div\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf2 \strokec2 "flex items-center justify-center gap-4"\cf0 \strokec4 ,\cb1 \
\cb3         verticalAlign === \cf2 \strokec2 "top"\cf0 \strokec4  ? \cf2 \strokec2 "pb-3"\cf0 \strokec4  : \cf2 \strokec2 "pt-3"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}>\cb1 \
\cb3       \{payload.map((item) => \{\cb1 \
\cb3         \cf5 \strokec5 const\cf0 \strokec4  key = \cf2 \strokec2 `\cf0 \strokec4 $\{nameKey || item.dataKey || \cf2 \strokec2 "value"\cf0 \strokec4 \}\cf2 \strokec2 `\cf0 \cb1 \strokec4 \
\cb3         \cf5 \strokec5 const\cf0 \strokec4  itemConfig = getPayloadConfigFromPayload(config, item, key)\cb1 \
\
\cb3         \cf5 \strokec5 return\cf0 \strokec4  (\cb1 \
\cb3           (<div\cb1 \
\cb3             key=\{item.value\}\cb1 \
\cb3             className=\{cn(\cb1 \
\cb3               \cf2 \strokec2 "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"\cf0 \cb1 \strokec4 \
\cb3             )\}>\cb1 \
\cb3             \{itemConfig?.icon && !hideIcon ? (\cb1 \
\cb3               <itemConfig.icon />\cb1 \
\cb3             ) : (\cb1 \
\cb3               <div\cb1 \
\cb3                 className=\cf2 \strokec2 "h-2 w-2 shrink-0 rounded-[2px]"\cf0 \cb1 \strokec4 \
\cb3                 style=\{\{\cb1 \
\cb3                   backgroundColor: item.color,\cb1 \
\cb3                 \}\} />\cb1 \
\cb3             )\}\cb1 \
\cb3             \{itemConfig?.label\}\cb1 \
\cb3           </div>)\cb1 \
\cb3         );\cb1 \
\cb3       \})\}\cb1 \
\cb3     </div>)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 ChartLegendContent\cf0 \strokec4 .displayName = \cf2 \strokec2 "ChartLegend"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 // Helper to extract item config from a payload.\cf0 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 function\cf0 \strokec4  getPayloadConfigFromPayload(\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   config,\cb1 \
\cb3   payload,\cb1 \
\cb3   key\cb1 \
\cb3 ) \{\cb1 \
\cb3   \cf5 \strokec5 if\cf0 \strokec4  (\cf5 \strokec5 typeof\cf0 \strokec4  payload !== \cf2 \strokec2 "object"\cf0 \strokec4  || payload === \cf5 \strokec5 null\cf0 \strokec4 ) \{\cb1 \
\cb3     \cf5 \strokec5 return\cf0 \strokec4  \cf5 \strokec5 undefined\cf0 \cb1 \strokec4 \
\cb3   \}\cb1 \
\
\cb3   \cf5 \strokec5 const\cf0 \strokec4  payloadPayload =\cb1 \
\cb3     \cf2 \strokec2 "payload"\cf0 \strokec4  \cf5 \strokec5 in\cf0 \strokec4  payload &&\cb1 \
\cb3     \cf5 \strokec5 typeof\cf0 \strokec4  payload.payload === \cf2 \strokec2 "object"\cf0 \strokec4  &&\cb1 \
\cb3     payload.payload !== \cf5 \strokec5 null\cf0 \cb1 \strokec4 \
\cb3       ? payload.payload\cb1 \
\cb3       : \cf5 \strokec5 undefined\cf0 \cb1 \strokec4 \
\
\cb3   \cf5 \strokec5 let\cf0 \strokec4  configLabelKey = key\cb1 \
\
\cb3   \cf5 \strokec5 if\cf0 \strokec4  (\cb1 \
\cb3     key \cf5 \strokec5 in\cf0 \strokec4  payload &&\cb1 \
\cb3     \cf5 \strokec5 typeof\cf0 \strokec4  payload[key] === \cf2 \strokec2 "string"\cf0 \cb1 \strokec4 \
\cb3   ) \{\cb1 \
\cb3     configLabelKey = payload[key]\cb1 \
\cb3   \} \cf5 \strokec5 else\cf0 \strokec4  \cf5 \strokec5 if\cf0 \strokec4  (\cb1 \
\cb3     payloadPayload &&\cb1 \
\cb3     key \cf5 \strokec5 in\cf0 \strokec4  payloadPayload &&\cb1 \
\cb3     \cf5 \strokec5 typeof\cf0 \strokec4  payloadPayload[key] === \cf2 \strokec2 "string"\cf0 \cb1 \strokec4 \
\cb3   ) \{\cb1 \
\cb3     configLabelKey = payloadPayload[key]\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf5 \strokec5 return\cf0 \strokec4  configLabelKey \cf5 \strokec5 in\cf0 \strokec4  config\cb1 \
\cb3     ? config[configLabelKey]\cb1 \
\cb3     : config[key];\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf0 \strokec4  \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 ChartContainer\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 ChartTooltip\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 ChartTooltipContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 ChartLegend\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 ChartLegendContent\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 ChartStyle\cf0 \strokec4 ,\cb1 \
\cb3 \}\cb1 \
\
}