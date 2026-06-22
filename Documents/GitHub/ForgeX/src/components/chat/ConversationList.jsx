{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red14\green110\blue109;\red144\green1\blue18;\red15\green112\blue1;\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c50196\c50196;\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c0;\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ motion, \cf5 \strokec5 AnimatePresence\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 'framer-motion'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf5 \strokec5 Search\cf0 \strokec4 , \cf5 \strokec5 X\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 'lucide-react'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ useState \} \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 'react'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf5 \strokec5 ThemeToggle\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf6 \strokec6 '@/components/chat/ThemeToggle'\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf5 \strokec5 ConversationList\cf0 \strokec4 (\{ conversations, activeId, onSelect, isOpen, onClose \}) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  [search, setSearch] = useState(\cf6 \strokec6 ''\cf0 \strokec4 );\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  filtered = conversations.filter(c =>\cb1 \
\cb3     c.participant_name?.toLowerCase().includes(search.toLowerCase())\cb1 \
\cb3   );\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <>\cb1 \
\cb3       \{isOpen && (\cb1 \
\cb3         <div className=\cf6 \strokec6 "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"\cf0 \strokec4  onClick=\{onClose\} />\cb1 \
\cb3       )\}\cb1 \
\
\cb3       <aside className=\{\cf6 \strokec6 `\cf0 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6         fixed lg:relative z-50 lg:z-0\cf0 \cb1 \strokec4 \
\cf6 \cb3 \strokec6         w-80 h-full flex flex-col\cf0 \cb1 \strokec4 \
\cf6 \cb3 \strokec6         glass-strong border-r border-[var(--glass-border)]\cf0 \cb1 \strokec4 \
\cf6 \cb3 \strokec6         transition-transform duration-300\cf0 \cb1 \strokec4 \
\cf6 \cb3 \strokec6         \cf0 \strokec4 $\{isOpen ? \cf6 \strokec6 'translate-x-0'\cf0 \strokec4  : \cf6 \strokec6 '-translate-x-full lg:translate-x-0'\cf0 \strokec4 \}\cb1 \
\cf6 \cb3 \strokec6       `\cf0 \strokec4 \}>\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3         \{\cf7 \strokec7 /* Header */\cf0 \strokec4 \}\cb1 \
\cb3         <div className=\cf6 \strokec6 "p-5 border-b border-[var(--glass-border)]"\cf0 \strokec4 >\cb1 \
\cb3           <div className=\cf6 \strokec6 "flex items-center justify-between mb-4"\cf0 \strokec4 >\cb1 \
\cb3             <h1 className=\cf6 \strokec6 "text-xl font-display font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"\cf0 \strokec4 >\cb1 \
\cb3               \cf5 \strokec5 Forge\cf0 \cb1 \strokec4 \
\cb3             </h1>\cb1 \
\cb3             <div className=\cf6 \strokec6 "flex items-center gap-1"\cf0 \strokec4 >\cb1 \
\cb3               <\cf5 \strokec5 ThemeToggle\cf0 \strokec4  />\cb1 \
\cb3               <button\cb1 \
\cb3                 onClick=\{onClose\}\cb1 \
\cb3                 className=\cf6 \strokec6 "lg:hidden p-2 rounded-xl hover:bg-[var(--glass-hover)] transition-colors"\cf0 \cb1 \strokec4 \
\cb3               >\cb1 \
\cb3                 <\cf5 \strokec5 X\cf0 \strokec4  className=\cf6 \strokec6 "w-5 h-5 text-muted-foreground"\cf0 \strokec4  />\cb1 \
\cb3               </button>\cb1 \
\cb3             </div>\cb1 \
\cb3           </div>\cb1 \
\cb3           <div className=\cf6 \strokec6 "relative"\cf0 \strokec4 >\cb1 \
\cb3             <\cf5 \strokec5 Search\cf0 \strokec4  className=\cf6 \strokec6 "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40"\cf0 \strokec4  />\cb1 \
\cb3             <input\cb1 \
\cb3               type=\cf6 \strokec6 "text"\cf0 \cb1 \strokec4 \
\cb3               placeholder=\cf6 \strokec6 "Search conversations..."\cf0 \cb1 \strokec4 \
\cb3               value=\{search\}\cb1 \
\cb3               onChange=\{(e) => setSearch(e.target.value)\}\cb1 \
\cb3               className=\cf6 \strokec6 "w-full bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground/80 placeholder-muted-foreground/50 focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"\cf0 \cb1 \strokec4 \
\cb3             />\cb1 \
\cb3           </div>\cb1 \
\cb3         </div>\cb1 \
\
\cb3         \{\cf7 \strokec7 /* Conversation list */\cf0 \strokec4 \}\cb1 \
\cb3         <div className=\cf6 \strokec6 "flex-1 overflow-y-auto px-3 py-2 space-y-1"\cf0 \strokec4 >\cb1 \
\cb3           <\cf5 \strokec5 AnimatePresence\cf0 \strokec4 >\cb1 \
\cb3             \{filtered.map((conv) => (\cb1 \
\cb3               <motion.button\cb1 \
\cb3                 key=\{conv.id\}\cb1 \
\cb3                 initial=\{\{ opacity: \cf8 \strokec8 0\cf0 \strokec4 , x: -\cf8 \strokec8 20\cf0 \strokec4  \}\}\cb1 \
\cb3                 animate=\{\{ opacity: \cf8 \strokec8 1\cf0 \strokec4 , x: \cf8 \strokec8 0\cf0 \strokec4  \}\}\cb1 \
\cb3                 exit=\{\{ opacity: \cf8 \strokec8 0\cf0 \strokec4 , x: -\cf8 \strokec8 20\cf0 \strokec4  \}\}\cb1 \
\cb3                 whileHover=\{\{ scale: \cf8 \strokec8 1.01\cf0 \strokec4  \}\}\cb1 \
\cb3                 whileTap=\{\{ scale: \cf8 \strokec8 0.98\cf0 \strokec4  \}\}\cb1 \
\cb3                 onClick=\{() => \{\cb1 \
\cb3                   onSelect(conv);\cb1 \
\cb3                   onClose();\cb1 \
\cb3                 \}\}\cb1 \
\cb3                 className=\{\cf6 \strokec6 `\cf0 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6                   w-full p-4 rounded-2xl text-left transition-all duration-200\cf0 \cb1 \strokec4 \
\cf6 \cb3 \strokec6                   \cf0 \strokec4 $\{activeId === conv.id\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3                     ? \cf6 \strokec6 'glass-strong border-primary/20 shadow-[0_0_20px_var(--orb-1)]'\cf0 \cb1 \strokec4 \
\cb3                     : \cf6 \strokec6 'hover:bg-[var(--glass-bg)] border border-transparent hover:border-[var(--glass-border)]'\cf0 \cb1 \strokec4 \
\cb3                   \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6                 `\cf0 \strokec4 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3               >\cb1 \
\cb3                 <div className=\cf6 \strokec6 "flex items-center gap-3"\cf0 \strokec4 >\cb1 \
\cb3                   <div className=\{\cf6 \strokec6 `\cf0 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6                     w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0\cf0 \cb1 \strokec4 \
\cf6 \cb3 \strokec6                     \cf0 \strokec4 $\{activeId === conv.id\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3                       ? \cf6 \strokec6 'bg-primary/15 text-primary'\cf0 \cb1 \strokec4 \
\cb3                       : \cf6 \strokec6 'bg-[var(--glass-bg-strong)] text-muted-foreground'\cf0 \cb1 \strokec4 \
\cb3                     \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6                   `\cf0 \strokec4 \}>\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3                     \{conv.participant_avatar || conv.participant_name?.[\cf8 \strokec8 0\cf0 \strokec4 ]?.toUpperCase()\}\cb1 \
\cb3                   </div>\cb1 \
\cb3                   <div className=\cf6 \strokec6 "flex-1 min-w-0"\cf0 \strokec4 >\cb1 \
\cb3                     <div className=\cf6 \strokec6 "flex items-center justify-between"\cf0 \strokec4 >\cb1 \
\cb3                       <span className=\cf6 \strokec6 "text-sm font-medium text-foreground truncate"\cf0 \strokec4 >\cb1 \
\cb3                         \{conv.participant_name\}\cb1 \
\cb3                       </span>\cb1 \
\cb3                       \{conv.last_message_time && (\cb1 \
\cb3                         <span className=\cf6 \strokec6 "text-[10px] text-muted-foreground/50 flex-shrink-0 ml-2"\cf0 \strokec4 >\cb1 \
\cb3                           \{\cf2 \strokec2 new\cf0 \strokec4  \cf5 \strokec5 Date\cf0 \strokec4 (conv.last_message_time).toLocaleDateString()\}\cb1 \
\cb3                         </span>\cb1 \
\cb3                       )\}\cb1 \
\cb3                     </div>\cb1 \
\cb3                     <div className=\cf6 \strokec6 "flex items-center justify-between mt-0.5"\cf0 \strokec4 >\cb1 \
\cb3                       <span className=\cf6 \strokec6 "text-xs text-muted-foreground/70 truncate"\cf0 \strokec4 >\cb1 \
\cb3                         \{conv.last_message_preview || \cf6 \strokec6 'No messages yet'\cf0 \strokec4 \}\cb1 \
\cb3                       </span>\cb1 \
\cb3                       \{conv.unread_count > \cf8 \strokec8 0\cf0 \strokec4  && (\cb1 \
\cb3                         <span className=\cf6 \strokec6 "ml-2 px-1.5 py-0.5 rounded-full bg-primary/15 text-[10px] text-primary font-medium flex-shrink-0"\cf0 \strokec4 >\cb1 \
\cb3                           \{conv.unread_count\}\cb1 \
\cb3                         </span>\cb1 \
\cb3                       )\}\cb1 \
\cb3                     </div>\cb1 \
\cb3                     \{conv.preferred_language && conv.preferred_language !== \cf6 \strokec6 'en'\cf0 \strokec4  && (\cb1 \
\cb3                       <span className=\cf6 \strokec6 "text-[10px] text-muted-foreground/50 uppercase mt-1 inline-block"\cf0 \strokec4 >\cb1 \
\cb3                         \{conv.preferred_language\}\cb1 \
\cb3                       </span>\cb1 \
\cb3                     )\}\cb1 \
\cb3                   </div>\cb1 \
\cb3                 </div>\cb1 \
\cb3               </motion.button>\cb1 \
\cb3             ))\}\cb1 \
\cb3           </\cf5 \strokec5 AnimatePresence\cf0 \strokec4 >\cb1 \
\cb3           \{filtered.length === \cf8 \strokec8 0\cf0 \strokec4  && (\cb1 \
\cb3             <div className=\cf6 \strokec6 "text-center py-12 text-muted-foreground/50 text-sm"\cf0 \strokec4 >\cb1 \
\cb3               \cf5 \strokec5 No\cf0 \strokec4  conversations found\cb1 \
\cb3             </div>\cb1 \
\cb3           )\}\cb1 \
\cb3         </div>\cb1 \
\
\cb3         \{\cf7 \strokec7 /* New conversation button */\cf0 \strokec4 \}\cb1 \
\cb3         <div className=\cf6 \strokec6 "p-3 border-t border-[var(--glass-border)]"\cf0 \strokec4 >\cb1 \
\cb3           <button className=\cf6 \strokec6 "w-full py-3 rounded-xl bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] text-muted-foreground text-sm font-medium hover:bg-[var(--glass-hover)] hover:text-foreground/80 transition-all"\cf0 \strokec4 >\cb1 \
\cb3             + \cf5 \strokec5 New\cf0 \strokec4  \cf5 \strokec5 Conversation\cf0 \cb1 \strokec4 \
\cb3           </button>\cb1 \
\cb3         </div>\cb1 \
\cb3       </aside>\cb1 \
\cb3     </>\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
}