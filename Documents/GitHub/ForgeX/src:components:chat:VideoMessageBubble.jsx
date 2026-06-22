{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red144\green1\blue18;\red14\green110\blue109;\red19\green118\blue70;\red15\green112\blue1;\red191\green28\blue37;
}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;\cssrgb\c0\c50196\c0;\cssrgb\c80392\c19216\c19216;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ useState \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'react'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ motion \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'framer-motion'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf6 \strokec6 Play\cf0 \strokec4 , \cf6 \strokec6 Globe\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'lucide-react'\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf6 \strokec6 VideoMessageBubble\cf0 \strokec4 (\{ message, preferredLang \}) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  [isPlaying, setIsPlaying] = useState(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  isMe = message.sender === \cf5 \strokec5 'me'\cf0 \strokec4 ;\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  hasTranslation = message.translated_content && message.content !== message.translated_content;\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  displayCaptions = hasTranslation ? message.translated_content : message.content;\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <motion.div\cb1 \
\cb3       initial=\{\{ opacity: \cf7 \strokec7 0\cf0 \strokec4 , y: \cf7 \strokec7 20\cf0 \strokec4  \}\}\cb1 \
\cb3       animate=\{\{ opacity: \cf7 \strokec7 1\cf0 \strokec4 , y: \cf7 \strokec7 0\cf0 \strokec4  \}\}\cb1 \
\cb3       className=\{\cf5 \strokec5 `flex \cf0 \strokec4 $\{isMe ? \cf5 \strokec5 'justify-end'\cf0 \strokec4  : \cf5 \strokec5 'justify-start'\cf0 \strokec4 \}\cf5 \strokec5  px-4`\cf0 \strokec4 \}\cb1 \
\cb3     >\cb1 \
\cb3       <div className=\cf5 \strokec5 "max-w-[85%]"\cf0 \strokec4 >\cb1 \
\cb3         <div className=\cf5 \strokec5 "bg-white/70 backdrop-blur-3xl border border-white/70 rounded-3xl shadow-2xl overflow-hidden"\cf0 \strokec4 >\cb1 \
\cb3           \{\cf8 \cb3 \strokec8 /* Video Player */\cf0 \cb3 \strokec4 \}\cb1 \
\cb3           <div\cb1 \
\cb3             className=\cf5 \strokec5 "relative aspect-video bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center cursor-pointer"\cf0 \cb1 \strokec4 \
\cb3             onClick=\{() => setIsPlaying(!isPlaying)\}\cb1 \
\cb3           >\cb1 \
\cb3             <motion.div\cb1 \
\cb3               whileTap=\{\{ scale: \cf7 \strokec7 0.95\cf0 \strokec4  \}\}\cb1 \
\cb3               className=\cf5 \strokec5 "w-16 h-16 bg-white/90 backdrop-blur-2xl rounded-2xl flex items-center justify-center shadow-xl"\cf0 \cb1 \strokec4 \
\cb3             >\cb1 \
\cb3               <\cf6 \strokec6 Play\cf0 \strokec4  className=\cf5 \strokec5 "w-8 h-8 text-violet-700 ml-0.5"\cf0 \strokec4  />\cb1 \
\cb3             </motion.div>\cb1 \
\
\cb3             \{\cf8 \cb3 \strokec8 /* Auto Captions Overlay */\cf0 \cb3 \strokec4 \}\cb1 \
\cb3             \{displayCaptions && (\cb1 \
\cb3               <div className=\cf5 \strokec5 "absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs px-4 py-2 rounded-2xl line-clamp-2"\cf0 \strokec4 >\cb1 \
\cb3                 \cf6 \strokec6 Auto\cf0 \strokec4  captions: \cf5 \strokec5 "\{displayCaptions\}"\cf0 \cb1 \strokec4 \
\cb3               </div>\cb1 \
\cb3             )\}\cb1 \
\
\cb3             \{hasTranslation && (\cb1 \
\cb3               <div className=\cf5 \strokec5 "absolute top-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-md text-violet-700 text-xs rounded-2xl flex items-center gap-1"\cf0 \strokec4 >\cb1 \
\cb3                 <\cf6 \strokec6 Globe\cf0 \strokec4  className=\cf5 \strokec5 "w-3 h-3"\cf0 \strokec4  /> \cf6 \strokec6 Translated\cf0 \cb1 \strokec4 \
\cb3               </div>\cb1 \
\cb3             )\}\cb1 \
\cb3           </div>\cb1 \
\
\cb3           <div className=\cf5 \strokec5 "p-4 text-sm text-violet-700"\cf0 \strokec4 >\cb1 \
\cb3             \cf6 \strokec6 Video\cf0 \strokec4  message \cf9 \cb3 \strokec9 \'b7\cf0 \cb3 \strokec4  \{message.duration || \cf5 \strokec5 '0:00'\cf0 \strokec4 \}\cb1 \
\cb3           </div>\cb1 \
\cb3         </div>\cb1 \
\cb3       </div>\cb1 \
\cb3     </motion.div>\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
}