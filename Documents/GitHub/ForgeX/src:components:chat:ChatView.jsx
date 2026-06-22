{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red144\green1\blue18;\red14\green110\blue109;\red15\green112\blue1;\red191\green28\blue37;\red19\green118\blue70;
}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c0\c50196\c0;\cssrgb\c80392\c19216\c19216;\cssrgb\c3529\c52549\c34510;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ useRef, useEffect, useState \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'react'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ motion, \cf6 \strokec6 AnimatePresence\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'framer-motion'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf6 \strokec6 ArrowLeft\cf0 \strokec4 , \cf6 \strokec6 Users\cf0 \strokec4 , \cf6 \strokec6 Settings\cf0 \strokec4 , \cf6 \strokec6 Globe\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'lucide-react'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf6 \strokec6 TextMessage\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/components/chat/TextMessage'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf6 \strokec6 VoiceNoteBubble\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/components/chat/VoiceNoteBubble'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf6 \strokec6 VideoMessageBubble\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/components/chat/VideoMessageBubble'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf6 \strokec6 MessageInput\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/components/chat/MessageInput'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf6 \strokec6 LanguageSettings\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/components/chat/LanguageSettings'\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf6 \strokec6 LANG_MAP\cf0 \strokec4  = \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf6 \strokec6 English\cf0 \strokec4 : \cf5 \strokec5 'en'\cf0 \strokec4 , \cf6 \strokec6 Spanish\cf0 \strokec4 : \cf5 \strokec5 'es'\cf0 \strokec4 , \cf6 \strokec6 French\cf0 \strokec4 : \cf5 \strokec5 'fr'\cf0 \strokec4 , \cf6 \strokec6 German\cf0 \strokec4 : \cf5 \strokec5 'de'\cf0 \strokec4 , \cf6 \strokec6 Japanese\cf0 \strokec4 : \cf5 \strokec5 'ja'\cf0 \strokec4 ,\cb1 \
\cb3   \cf6 \strokec6 Chinese\cf0 \strokec4 : \cf5 \strokec5 'zh'\cf0 \strokec4 , \cf6 \strokec6 Portuguese\cf0 \strokec4 : \cf5 \strokec5 'pt'\cf0 \strokec4 , \cf6 \strokec6 Arabic\cf0 \strokec4 : \cf5 \strokec5 'ar'\cf0 \strokec4 , \cf6 \strokec6 Hindi\cf0 \strokec4 : \cf5 \strokec5 'hi'\cf0 \strokec4 , \cf6 \strokec6 Russian\cf0 \strokec4 : \cf5 \strokec5 'ru'\cf0 \cb1 \strokec4 \
\cb3 \};\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf0 \strokec4  \cf6 \strokec6 LANG_NAMES\cf0 \strokec4  = \cf6 \strokec6 Object\cf0 \strokec4 .fromEntries(\cf6 \strokec6 Object\cf0 \strokec4 .entries(\cf6 \strokec6 LANG_MAP\cf0 \strokec4 ).map(([k, v]) => [v, k]));\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf6 \strokec6 ChatView\cf0 \strokec4 (\{ conversation, messages, onSendMessage, onStartRecording, isProcessing, onBack, onLanguageChange \}) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  messagesEndRef = useRef(\cf2 \strokec2 null\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [langSettingsOpen, setLangSettingsOpen] = useState(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\
\cb3   useEffect(() => \{\cb1 \
\cb3     messagesEndRef.current?.scrollIntoView(\{ behavior: \cf5 \strokec5 'smooth'\cf0 \strokec4  \});\cb1 \
\cb3   \}, [messages]);\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  preferredLang = conversation?.preferred_language || \cf5 \strokec5 'en'\cf0 \strokec4 ;\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  handleLanguageSelect = (langName) => \{\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  code = \cf6 \strokec6 LANG_MAP\cf0 \strokec4 [langName] || \cf5 \strokec5 'en'\cf0 \strokec4 ;\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (onLanguageChange) onLanguageChange(code);\cb1 \
\cb3   \};\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <div className=\cf5 \strokec5 "flex-1 flex flex-col h-full"\cf0 \strokec4 >\cb1 \
\cb3       \{\cf7 \strokec7 /* Chat header */\cf0 \strokec4 \}\cb1 \
\cb3       <div className=\cf5 \strokec5 "h-20 bg-white/70 backdrop-blur-3xl border-b border-white/60 px-6 flex items-center gap-4 z-10"\cf0 \strokec4 >\cb1 \
\cb3         <button\cb1 \
\cb3           onClick=\{onBack\}\cb1 \
\cb3           className=\cf5 \strokec5 "lg:hidden p-2 rounded-xl hover:bg-white/80 transition-colors"\cf0 \cb1 \strokec4 \
\cb3         >\cb1 \
\cb3           <\cf6 \strokec6 ArrowLeft\cf0 \strokec4  className=\cf5 \strokec5 "w-5 h-5 text-violet-700"\cf0 \strokec4  />\cb1 \
\cb3         </button>\cb1 \
\cb3         <div className=\cf5 \strokec5 "w-12 h-12 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 shadow-md flex-shrink-0"\cf0 \strokec4  />\cb1 \
\cb3         <div className=\cf5 \strokec5 "flex-1"\cf0 \strokec4 >\cb1 \
\cb3           <h2 className=\cf5 \strokec5 "font-bold text-xl text-violet-950"\cf0 \strokec4 >\{conversation?.participant_name\}</h2>\cb1 \
\cb3           <div className=\cf5 \strokec5 "text-emerald-600 text-xs flex items-center gap-1.5"\cf0 \strokec4 >\cb1 \
\cb3             \cf8 \strokec8 \uc0\u9679 \cf0 \strokec4  \cf6 \strokec6 Online\cf0 \strokec4  \cf8 \strokec8 \'b7\cf0 \strokec4  \cf6 \strokec6 Translated\cf0 \strokec4  to \{\cf6 \strokec6 LANG_NAMES\cf0 \strokec4 [preferredLang] || \cf5 \strokec5 'English'\cf0 \strokec4 \}\cb1 \
\cb3           </div>\cb1 \
\cb3         </div>\cb1 \
\cb3         <div className=\cf5 \strokec5 "flex items-center gap-2"\cf0 \strokec4 >\cb1 \
\cb3           <button\cb1 \
\cb3             onClick=\{() => setLangSettingsOpen(\cf2 \strokec2 true\cf0 \strokec4 )\}\cb1 \
\cb3             className=\cf5 \strokec5 "flex items-center gap-2 px-4 py-2.5 bg-white/70 hover:bg-white/90 backdrop-blur-2xl rounded-2xl text-violet-700 transition-all border border-white/60"\cf0 \cb1 \strokec4 \
\cb3           >\cb1 \
\cb3             <\cf6 \strokec6 Globe\cf0 \strokec4  className=\cf5 \strokec5 "w-5 h-5"\cf0 \strokec4  />\cb1 \
\cb3             <span className=\cf5 \strokec5 "hidden sm:inline"\cf0 \strokec4 >\cf6 \strokec6 Language\cf0 \strokec4 </span>\cb1 \
\cb3           </button>\cb1 \
\cb3           <button className=\cf5 \strokec5 "p-2.5 rounded-2xl hover:bg-white/80 transition-all"\cf0 \strokec4 >\cb1 \
\cb3             <\cf6 \strokec6 Users\cf0 \strokec4  className=\cf5 \strokec5 "w-5 h-5 text-violet-700"\cf0 \strokec4  />\cb1 \
\cb3           </button>\cb1 \
\cb3           <button className=\cf5 \strokec5 "p-2.5 rounded-2xl hover:bg-white/80 transition-all"\cf0 \strokec4 >\cb1 \
\cb3             <\cf6 \strokec6 Settings\cf0 \strokec4  className=\cf5 \strokec5 "w-5 h-5 text-violet-700"\cf0 \strokec4  />\cb1 \
\cb3           </button>\cb1 \
\cb3         </div>\cb1 \
\cb3       </div>\cb1 \
\
\cb3       \{\cf7 \strokec7 /* Messages */\cf0 \strokec4 \}\cb1 \
\cb3       <div className=\cf5 \strokec5 "flex-1 overflow-y-auto py-4 space-y-3"\cf0 \strokec4 >\cb1 \
\cb3         <\cf6 \strokec6 AnimatePresence\cf0 \strokec4 >\cb1 \
\cb3           \{messages.map((msg) => \{\cb1 \
\cb3             \cf2 \strokec2 const\cf0 \strokec4  myMessages = messages.filter(m => m.sender === \cf5 \strokec5 'me'\cf0 \strokec4 );\cb1 \
\cb3             \cf2 \strokec2 const\cf0 \strokec4  latestMyMsg = myMessages.slice(-\cf9 \strokec9 1\cf0 \strokec4 )[\cf9 \strokec9 0\cf0 \strokec4 ];\cb1 \
\cb3             \cf2 \strokec2 const\cf0 \strokec4  isTranslating = latestMyMsg?.id === msg.id && !msg.translated_content;\cb1 \
\cb3             \cf2 \strokec2 if\cf0 \strokec4  (msg.type === \cf5 \strokec5 'voice'\cf0 \strokec4 ) \cf2 \strokec2 return\cf0 \strokec4  <\cf6 \strokec6 VoiceNoteBubble\cf0 \strokec4  key=\{msg.id\} message=\{msg\} preferredLang=\{preferredLang\} />;\cb1 \
\cb3             \cf2 \strokec2 if\cf0 \strokec4  (msg.type === \cf5 \strokec5 'video'\cf0 \strokec4 ) \cf2 \strokec2 return\cf0 \strokec4  <\cf6 \strokec6 VideoMessageBubble\cf0 \strokec4  key=\{msg.id\} message=\{msg\} preferredLang=\{preferredLang\} />;\cb1 \
\cb3             \cf2 \strokec2 return\cf0 \strokec4  <\cf6 \strokec6 TextMessage\cf0 \strokec4  key=\{msg.id\} message=\{msg\} preferredLang=\{preferredLang\} isTranslating=\{isTranslating\} />;\cb1 \
\cb3           \})\}\cb1 \
\cb3         </\cf6 \strokec6 AnimatePresence\cf0 \strokec4 >\cb1 \
\cb3         \{messages.length === \cf9 \strokec9 0\cf0 \strokec4  && (\cb1 \
\cb3           <div className=\cf5 \strokec5 "flex items-center justify-center h-full"\cf0 \strokec4 >\cb1 \
\cb3             <div className=\cf5 \strokec5 "text-center"\cf0 \strokec4 >\cb1 \
\cb3               <div className=\cf5 \strokec5 "w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/50 flex items-center justify-center"\cf0 \strokec4 >\cb1 \
\cb3                 <span className=\cf5 \strokec5 "text-2xl"\cf0 \strokec4 >\cf8 \strokec8 \uc0\u55357 \u56492 \cf0 \strokec4 </span>\cb1 \
\cb3               </div>\cb1 \
\cb3               <p className=\cf5 \strokec5 "text-sm text-violet-500/60"\cf0 \strokec4 >\cf6 \strokec6 Send\cf0 \strokec4  a message to start translating</p>\cb1 \
\cb3             </div>\cb1 \
\cb3           </div>\cb1 \
\cb3         )\}\cb1 \
\cb3         <div ref=\{messagesEndRef\} />\cb1 \
\cb3       </div>\cb1 \
\
\cb3       <\cf6 \strokec6 MessageInput\cf0 \cb1 \strokec4 \
\cb3         onSend=\{onSendMessage\}\cb1 \
\cb3         onStartRecording=\{onStartRecording\}\cb1 \
\cb3         isProcessing=\{isProcessing\}\cb1 \
\cb3       />\cb1 \
\
\cb3       <\cf6 \strokec6 LanguageSettings\cf0 \cb1 \strokec4 \
\cb3         isOpen=\{langSettingsOpen\}\cb1 \
\cb3         onClose=\{() => setLangSettingsOpen(\cf2 \strokec2 false\cf0 \strokec4 )\}\cb1 \
\cb3         preferredLang=\{\cf6 \strokec6 LANG_NAMES\cf0 \strokec4 [preferredLang] || \cf5 \strokec5 'English'\cf0 \strokec4 \}\cb1 \
\cb3         onSelectLang=\{handleLanguageSelect\}\cb1 \
\cb3       />\cb1 \
\cb3     </div>\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
}