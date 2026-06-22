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
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 OTPInput\cf0 \strokec4 , \cf5 \strokec5 OTPInputContext\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "input-otp"\cf0 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Minus\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "lucide-react"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ cn \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 "@/lib/utils"\cf0 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 InputOTP\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, containerClassName, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <\cf5 \strokec5 OTPInput\cf0 \cb1 \strokec4 \
\cb3     ref=\{ref\}\cb1 \
\cb3     containerClassName=\{cn(\cf6 \strokec6 "flex items-center gap-2 has-[:disabled]:opacity-50"\cf0 \strokec4 , containerClassName)\}\cb1 \
\cb3     className=\{cn(\cf6 \strokec6 "disabled:cursor-not-allowed"\cf0 \strokec4 , className)\}\cb1 \
\cb3     \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 InputOTP\cf0 \strokec4 .displayName = \cf6 \strokec6 "InputOTP"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 InputOTPGroup\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ className, ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div ref=\{ref\} className=\{cn(\cf6 \strokec6 "flex items-center"\cf0 \strokec4 , className)\} \{...props\} />\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 InputOTPGroup\cf0 \strokec4 .displayName = \cf6 \strokec6 "InputOTPGroup"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 InputOTPSlot\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ index, className, ...props \}, ref) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  inputOTPContext = \cf5 \strokec5 React\cf0 \strokec4 .useContext(\cf5 \strokec5 OTPInputContext\cf0 \strokec4 )\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  \{ char, hasFakeCaret, isActive \} = inputOTPContext.slots[index]\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     (<div\cb1 \
\cb3       ref=\{ref\}\cb1 \
\cb3       className=\{cn(\cb1 \
\cb3         \cf6 \strokec6 "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md"\cf0 \strokec4 ,\cb1 \
\cb3         isActive && \cf6 \strokec6 "z-10 ring-1 ring-ring"\cf0 \strokec4 ,\cb1 \
\cb3         className\cb1 \
\cb3       )\}\cb1 \
\cb3       \{...props\}>\cb1 \
\cb3       \{char\}\cb1 \
\cb3       \{hasFakeCaret && (\cb1 \
\cb3         <div\cb1 \
\cb3           className=\cf6 \strokec6 "pointer-events-none absolute inset-0 flex items-center justify-center"\cf0 \strokec4 >\cb1 \
\cb3           <div className=\cf6 \strokec6 "h-4 w-px animate-caret-blink bg-foreground duration-1000"\cf0 \strokec4  />\cb1 \
\cb3         </div>\cb1 \
\cb3       )\}\cb1 \
\cb3     </div>)\cb1 \
\cb3   );\cb1 \
\cb3 \})\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 InputOTPSlot\cf0 \strokec4 .displayName = \cf6 \strokec6 "InputOTPSlot"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 InputOTPSeparator\cf0 \strokec4  = \cf5 \strokec5 React\cf0 \strokec4 .forwardRef((\{ ...props \}, ref) => (\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   <div ref=\{ref\} role=\cf6 \strokec6 "separator"\cf0 \strokec4  \{...props\}>\cb1 \
\cb3     <\cf5 \strokec5 Minus\cf0 \strokec4  />\cb1 \
\cb3   </div>\cb1 \
\cb3 ))\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 InputOTPSeparator\cf0 \strokec4 .displayName = \cf6 \strokec6 "InputOTPSeparator"\cf0 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \{ \cf5 \strokec5 InputOTP\cf0 \strokec4 , \cf5 \strokec5 InputOTPGroup\cf0 \strokec4 , \cf5 \strokec5 InputOTPSlot\cf0 \strokec4 , \cf5 \strokec5 InputOTPSeparator\cf0 \strokec4  \}\cb1 \
\
}