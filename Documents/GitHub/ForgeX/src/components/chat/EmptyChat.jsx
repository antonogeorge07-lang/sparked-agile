{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red144\green1\blue18;\red14\green110\blue109;\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ motion \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'framer-motion'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf6 \strokec6 MessageSquare\cf0 \strokec4 , \cf6 \strokec6 Globe\cf0 \strokec4 , \cf6 \strokec6 Mic\cf0 \strokec4 , \cf6 \strokec6 Sparkles\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'lucide-react'\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf6 \strokec6 EmptyChat\cf0 \strokec4 (\{ onMenuClick \}) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <div className=\cf5 \strokec5 "flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#ffffff50_1px,transparent_1px)] bg-[length:50px_50px]"\cf0 \strokec4 >\cb1 \
\cb3       <div className=\cf5 \strokec5 "text-center max-w-sm"\cf0 \strokec4 >\cb1 \
\cb3         <motion.div\cb1 \
\cb3           animate=\{\{ rotate: [\cf7 \strokec7 0\cf0 \strokec4 , \cf7 \strokec7 5\cf0 \strokec4 , -\cf7 \strokec7 5\cf0 \strokec4 , \cf7 \strokec7 0\cf0 \strokec4 ] \}\}\cb1 \
\cb3           transition=\{\{ duration: \cf7 \strokec7 6\cf0 \strokec4 , repeat: \cf6 \strokec6 Infinity\cf0 \strokec4 , ease: \cf5 \strokec5 'easeInOut'\cf0 \strokec4  \}\}\cb1 \
\cb3           className=\cf5 \strokec5 "w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 shadow-lg shadow-fuchsia-500/20 flex items-center justify-center"\cf0 \cb1 \strokec4 \
\cb3         >\cb1 \
\cb3           <\cf6 \strokec6 MessageSquare\cf0 \strokec4  className=\cf5 \strokec5 "w-11 h-11 text-white"\cf0 \strokec4  />\cb1 \
\cb3         </motion.div>\cb1 \
\
\cb3         <h2 className=\cf5 \strokec5 "text-2xl font-display font-bold text-violet-950 mb-2"\cf0 \strokec4 >\cb1 \
\cb3           \cf6 \strokec6 Welcome\cf0 \strokec4  to \cf6 \strokec6 Forge\cf0 \cb1 \strokec4 \
\cb3         </h2>\cb1 \
\cb3         <p className=\cf5 \strokec5 "text-sm text-violet-700/60 mb-10 leading-relaxed"\cf0 \strokec4 >\cb1 \
\cb3           \cf6 \strokec6 Speak\cf0 \strokec4  any language. \cf6 \strokec6 Be\cf0 \strokec4  understood \cf2 \strokec2 in\cf0 \strokec4  yours.\cb1 \
\cb3         </p>\cb1 \
\
\cb3         <div className=\cf5 \strokec5 "space-y-3"\cf0 \strokec4 >\cb1 \
\cb3           <div className=\cf5 \strokec5 "flex items-center gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-sm"\cf0 \strokec4 >\cb1 \
\cb3             <div className=\cf5 \strokec5 "w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center flex-shrink-0"\cf0 \strokec4 >\cb1 \
\cb3               <\cf6 \strokec6 Globe\cf0 \strokec4  className=\cf5 \strokec5 "w-4 h-4 text-violet-600"\cf0 \strokec4  />\cb1 \
\cb3             </div>\cb1 \
\cb3             <span className=\cf5 \strokec5 "text-sm text-violet-900/70 text-left"\cf0 \strokec4 >\cf6 \strokec6 Auto\cf0 \strokec4 -translate messages \cf2 \strokec2 in\cf0 \strokec4  real-time</span>\cb1 \
\cb3           </div>\cb1 \
\cb3           <div className=\cf5 \strokec5 "flex items-center gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-sm"\cf0 \strokec4 >\cb1 \
\cb3             <div className=\cf5 \strokec5 "w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 flex items-center justify-center flex-shrink-0"\cf0 \strokec4 >\cb1 \
\cb3               <\cf6 \strokec6 Mic\cf0 \strokec4  className=\cf5 \strokec5 "w-4 h-4 text-cyan-600"\cf0 \strokec4  />\cb1 \
\cb3             </div>\cb1 \
\cb3             <span className=\cf5 \strokec5 "text-sm text-violet-900/70 text-left"\cf0 \strokec4 >\cf6 \strokec6 Record\cf0 \strokec4  voice notes, transcribed and translated</span>\cb1 \
\cb3           </div>\cb1 \
\cb3           <div className=\cf5 \strokec5 "flex items-center gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-sm"\cf0 \strokec4 >\cb1 \
\cb3             <div className=\cf5 \strokec5 "w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0"\cf0 \strokec4 >\cb1 \
\cb3               <\cf6 \strokec6 Sparkles\cf0 \strokec4  className=\cf5 \strokec5 "w-4 h-4 text-fuchsia-600"\cf0 \strokec4  />\cb1 \
\cb3             </div>\cb1 \
\cb3             <span className=\cf5 \strokec5 "text-sm text-violet-900/70 text-left"\cf0 \strokec4 >\cf6 \strokec6 Living\cf0 \strokec4  knowledge \cf2 \strokec2 from\cf0 \strokec4  your conversations</span>\cb1 \
\cb3           </div>\cb1 \
\cb3         </div>\cb1 \
\
\cb3         <button\cb1 \
\cb3           onClick=\{onMenuClick\}\cb1 \
\cb3           className=\cf5 \strokec5 "mt-10 px-8 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-fuchsia-500/25 hover:shadow-xl hover:shadow-fuchsia-500/30 transition-all lg:hidden"\cf0 \cb1 \strokec4 \
\cb3         >\cb1 \
\cb3           \cf6 \strokec6 Open\cf0 \strokec4  conversations\cb1 \
\cb3         </button>\cb1 \
\cb3       </div>\cb1 \
\cb3     </div>\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
}