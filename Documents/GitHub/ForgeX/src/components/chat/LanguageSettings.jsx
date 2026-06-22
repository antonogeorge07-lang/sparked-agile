{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red14\green110\blue109;\red144\green1\blue18;\red19\green118\blue70;\red88\green94\blue109;\red255\green255\blue255;
\red138\green146\blue159;\red18\green18\blue18;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c50196\c50196;\cssrgb\c63922\c8235\c8235;\cssrgb\c3529\c52549\c34510;\cssrgb\c41961\c44706\c50196;\cssrgb\c100000\c100000\c100000;
\cssrgb\c61176\c63922\c68627;\cssrgb\c9020\c9020\c9020;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ motion, \cf5 \strokec5 AnimatePresence\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 'framer-motion'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 X\cf0 \strokec4 , \cf5 \strokec5 Check\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 'lucide-react'\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf5 \strokec5 LANGUAGES\cf0 \strokec4  = [\cb1 \
\cb3   \cf6 \strokec6 "English"\cf0 \strokec4 , \cf6 \strokec6 "Spanish"\cf0 \strokec4 , \cf6 \strokec6 "French"\cf0 \strokec4 , \cf6 \strokec6 "German"\cf0 \strokec4 , \cf6 \strokec6 "Japanese"\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 "Chinese"\cf0 \strokec4 , \cf6 \strokec6 "Portuguese"\cf0 \strokec4 , \cf6 \strokec6 "Arabic"\cf0 \strokec4 , \cf6 \strokec6 "Hindi"\cf0 \strokec4 , \cf6 \strokec6 "Russian"\cf0 \cb1 \strokec4 \
\cb3 ];\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf5 \strokec5 LanguageSettings\cf0 \strokec4 (\{ isOpen, onClose, preferredLang, onSelectLang \}) \{\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  selected = preferredLang || \cf6 \strokec6 'English'\cf0 \strokec4 ;\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <\cf5 \strokec5 AnimatePresence\cf0 \strokec4 >\cb1 \
\cb3       \{isOpen && (\cb1 \
\cb3         <div className=\cf6 \strokec6 "fixed inset-0 bg-black/40 backdrop-blur-xl z-50 flex items-center justify-center p-4"\cf0 \strokec4 >\cb1 \
\cb3           <motion.div\cb1 \
\cb3             initial=\{\{ opacity: \cf7 \strokec7 0\cf0 \strokec4 , scale: \cf7 \strokec7 0.9\cf0 \strokec4  \}\}\cb1 \
\cb3             animate=\{\{ opacity: \cf7 \strokec7 1\cf0 \strokec4 , scale: \cf7 \strokec7 1\cf0 \strokec4  \}\}\cb1 \
\cb3             exit=\{\{ opacity: \cf7 \strokec7 0\cf0 \strokec4 , scale: \cf7 \strokec7 0.9\cf0 \strokec4  \}\}\cb1 \
\cb3             className=\cf6 \strokec6 "bg-white/80 backdrop-blur-3xl border border-white/70 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"\cf0 \cb1 \strokec4 \
\cb3           >\cb1 \
\cb3             <div className=\cf6 \strokec6 "flex justify-between items-center p-6 border-b border-white/60"\cf0 \strokec4 >\cb1 \
\cb3               <h2 className=\cf6 \strokec6 "text-xl font-bold text-violet-950"\cf0 \strokec4 >\cf5 \strokec5 Language\cf0 \strokec4  \cf5 \strokec5 Preferences\cf0 \strokec4 </h2>\cb1 \
\cb3               <button onClick=\{onClose\} className=\cf6 \strokec6 "text-violet-600 hover:text-violet-800 transition-colors"\cf0 \strokec4 >\cb1 \
\cb3                 <\cf5 \strokec5 X\cf0 \strokec4  className=\cf6 \strokec6 "w-6 h-6"\cf0 \strokec4  />\cb1 \
\cb3               </button>\cb1 \
\cb3             </div>\cb1 \
\
\cb3             <div className=\cf6 \strokec6 "p-6 space-y-6 max-h-[60vh] overflow-y-auto"\cf0 \strokec4 >\cb1 \
\cb3               <div>\cb1 \
\cb3                 <p className=\cf6 \strokec6 "text-violet-700 mb-3 font-medium"\cf0 \strokec4 >\cf5 \strokec5 My\cf0 \strokec4  \cf5 \strokec5 Preferred\cf0 \strokec4  \cf5 \strokec5 Language\cf0 \strokec4 </p>\cb1 \
\cb3                 <div className=\cf6 \strokec6 "bg-white/70 rounded-2xl p-4 flex items-center justify-between"\cf0 \strokec4 >\cb1 \
\cb3                   <span className=\cf6 \strokec6 "text-lg text-violet-950"\cf0 \strokec4 >\{selected\}</span>\cb1 \
\cb3                   <\cf5 \strokec5 Check\cf0 \strokec4  className=\cf6 \strokec6 "text-emerald-500 w-5 h-5"\cf0 \strokec4  />\cb1 \
\cb3                 </div>\cb1 \
\cb3               </div>\cb1 \
\
\cb3               <div>\cb1 \
\cb3                 <p className=\cf6 \strokec6 "text-violet-700 mb-3 font-medium"\cf0 \strokec4 >\cf5 \strokec5 Auto\cf0 \strokec4 -translate incoming messages</p>\cb1 \
\cb3                 <div className=\cf6 \strokec6 "space-y-2"\cf0 \strokec4 >\cb1 \
\cb3                   \{\cf5 \strokec5 LANGUAGES\cf0 \strokec4 .map(lang => (\cb1 \
\cb3                     <div\cb1 \
\cb3                       key=\{lang\}\cb1 \
\cb3                       onClick=\{() => onSelectLang(lang)\}\cb1 \
\cb3                       className=\cf6 \strokec6 "flex items-center justify-between bg-white/60 hover:bg-white/80 px-5 py-4 rounded-2xl transition-all cursor-pointer"\cf0 \cb1 \strokec4 \
\cb3                     >\cb1 \
\cb3                       <span className=\cf6 \strokec6 "text-violet-950"\cf0 \strokec4 >\{lang\}</span>\cb1 \
\cb3                       <div className=\{\cf6 \strokec6 `w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center \cf0 \strokec4 $\{lang === selected ? \cf6 \strokec6 'border-emerald-500 bg-emerald-500'\cf0 \strokec4  : \cf6 \strokec6 'border-violet-400'\cf0 \strokec4 \}\cf6 \strokec6 `\cf0 \strokec4 \}>\cb1 \
\cb3                         \{lang === selected && <\cf5 \strokec5 Check\cf0 \strokec4  className=\cf6 \strokec6 "w-3 h-3 text-white"\cf0 \strokec4  />\}\cb1 \
\cb3                       </div>\cb1 \
\cb3                     </div>\cb1 \
\cb3                   ))\}\cb1 \
\cb3                 </div>\cb1 \
\cb3               </div>\cb1 \
\cb3             </div>\cb1 \
\
\cb3             <div className=\cf6 \strokec6 "p-6 border-t border-white/60"\cf0 \strokec4 >\cb1 \
\cb3               <motion.button\cb1 \
\cb3                 whileTap=\{\{ scale: \cf7 \strokec7 0.97\cf0 \strokec4  \}\}\cb1 \
\cb3                 onClick=\{onClose\}\cb1 \
\cb3                 className=\cf6 \strokec6 "w-full h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-medium text-lg shadow-lg shadow-fuchsia-500/20 hover:brightness-110 transition-all"\cf0 \cb1 \strokec4 \
\cb3               >\cb1 \
\cb3                 \cf5 \strokec5 Save\cf0 \strokec4  \cf5 \strokec5 Preferences
\f1\fs28 \cf8 \cb9 \strokec8 src\cf10 \strokec10 /\cf8 \strokec8 components\cf10 \strokec10 /\cf8 \strokec8 chat\cf10 \strokec10 /\cf11 \strokec11 MessageInput.jsx
\f0\fs26 \cf0 \cb1 \strokec4 \
\cb3               </motion.button>\cb1 \
\cb3             </div>\cb1 \
\cb3           </motion.div>\cb1 \
\cb3         </div>\cb1 \
\cb3       )\}\cb1 \
\cb3     </\cf5 \strokec5 AnimatePresence\cf0 \strokec4 >\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
}