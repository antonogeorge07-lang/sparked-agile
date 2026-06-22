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
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ useState \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'react'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ motion \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'framer-motion'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ \cf6 \strokec6 Send\cf0 \strokec4 , \cf6 \strokec6 Mic\cf0 \strokec4 , \cf6 \strokec6 Video\cf0 \strokec4 , \cf6 \strokec6 Image\cf0 \strokec4  as \cf6 \strokec6 ImageIcon\cf0 \strokec4 , \cf6 \strokec6 Loader2\cf0 \strokec4  \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'lucide-react'\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf6 \strokec6 MessageInput\cf0 \strokec4 (\{ onSend, onStartRecording, isProcessing \}) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  [text, setText] = useState(\cf5 \strokec5 ''\cf0 \strokec4 );\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  handleSend = () => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (!text.trim() || isProcessing) \cf2 \strokec2 return\cf0 \strokec4 ;\cb1 \
\cb3     onSend(text.trim());\cb1 \
\cb3     setText(\cf5 \strokec5 ''\cf0 \strokec4 );\cb1 \
\cb3   \};\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  handleKeyDown = (e) => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (e.key === \cf5 \strokec5 'Enter'\cf0 \strokec4  && !e.shiftKey) \{\cb1 \
\cb3       e.preventDefault();\cb1 \
\cb3       handleSend();\cb1 \
\cb3     \}\cb1 \
\cb3   \};\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <div className=\cf5 \strokec5 "p-4 border-t border-[var(--glass-border)]"\cf0 \strokec4 >\cb1 \
\cb3       <div className=\cf5 \strokec5 "flex items-end gap-3 glass rounded-2xl p-2 shadow-lg"\cf0 \strokec4 >\cb1 \
\cb3         <motion.button\cb1 \
\cb3           whileTap=\{\{ scale: \cf7 \strokec7 0.9\cf0 \strokec4  \}\}\cb1 \
\cb3           disabled=\{isProcessing\}\cb1 \
\cb3           className=\cf5 \strokec5 "p-2.5 rounded-xl bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/[0.05] transition-all flex-shrink-0 disabled:opacity-30"\cf0 \cb1 \strokec4 \
\cb3         >\cb1 \
\cb3           <\cf6 \strokec6 ImageIcon\cf0 \strokec4  className=\cf5 \strokec5 "w-5 h-5"\cf0 \strokec4  />\cb1 \
\cb3         </motion.button>\cb1 \
\
\cb3         <motion.button\cb1 \
\cb3           whileTap=\{\{ scale: \cf7 \strokec7 0.9\cf0 \strokec4  \}\}\cb1 \
\cb3           disabled=\{isProcessing\}\cb1 \
\cb3           className=\cf5 \strokec5 "p-2.5 rounded-xl bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/[0.05] transition-all flex-shrink-0 disabled:opacity-30"\cf0 \cb1 \strokec4 \
\cb3         >\cb1 \
\cb3           <\cf6 \strokec6 Video\cf0 \strokec4  className=\cf5 \strokec5 "w-5 h-5"\cf0 \strokec4  />\cb1 \
\cb3         </motion.button>\cb1 \
\
\cb3         <motion.button\cb1 \
\cb3           whileTap=\{\{ scale: \cf7 \strokec7 0.9\cf0 \strokec4  \}\}\cb1 \
\cb3           onClick=\{onStartRecording\}\cb1 \
\cb3           disabled=\{isProcessing\}\cb1 \
\cb3           className=\cf5 \strokec5 "p-2.5 rounded-xl bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/[0.05] transition-all flex-shrink-0 disabled:opacity-30"\cf0 \cb1 \strokec4 \
\cb3         >\cb1 \
\cb3           <\cf6 \strokec6 Mic\cf0 \strokec4  className=\cf5 \strokec5 "w-5 h-5"\cf0 \strokec4  />\cb1 \
\cb3         </motion.button>\cb1 \
\
\cb3         <input\cb1 \
\cb3           type=\cf5 \strokec5 "text"\cf0 \cb1 \strokec4 \
\cb3           value=\{text\}\cb1 \
\cb3           onChange=\{(e) => setText(e.target.value)\}\cb1 \
\cb3           onKeyDown=\{handleKeyDown\}\cb1 \
\cb3           placeholder=\cf5 \strokec5 "Type a message..."\cf0 \cb1 \strokec4 \
\cb3           disabled=\{isProcessing\}\cb1 \
\cb3           className=\cf5 \strokec5 "flex-1 bg-transparent text-sm text-foreground/80 placeholder-muted-foreground/50 py-2 px-1 focus:outline-none disabled:opacity-30"\cf0 \cb1 \strokec4 \
\cb3         />\cb1 \
\
\cb3         <motion.button\cb1 \
\cb3           whileTap=\{\{ scale: \cf7 \strokec7 0.9\cf0 \strokec4  \}\}\cb1 \
\cb3           onClick=\{handleSend\}\cb1 \
\cb3           disabled=\{!text.trim() || isProcessing\}\cb1 \
\cb3           className=\{\cf5 \strokec5 `\cf0 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5             p-2.5 rounded-xl flex-shrink-0 transition-all duration-300\cf0 \cb1 \strokec4 \
\cf5 \cb3 \strokec5             \cf0 \strokec4 $\{text.trim() && !isProcessing\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3               ? \cf5 \strokec5 'bg-primary text-primary-foreground shadow-[0_0_15px_var(--orb-1)]'\cf0 \cb1 \strokec4 \
\cb3               : \cf5 \strokec5 'bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] text-muted-foreground/40'\cf0 \cb1 \strokec4 \
\cb3             \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5           `\cf0 \strokec4 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3         >\cb1 \
\cb3           \{isProcessing ? (\cb1 \
\cb3             <\cf6 \strokec6 Loader2\cf0 \strokec4  className=\cf5 \strokec5 "w-5 h-5 animate-spin"\cf0 \strokec4  />\cb1 \
\cb3           ) : (\cb1 \
\cb3             <\cf6 \strokec6 Send\cf0 \strokec4  className=\cf5 \strokec5 "w-5 h-5"\cf0 \strokec4  />\cb1 \
\cb3           )\}\cb1 \
\cb3         </motion.button>\cb1 \
\cb3       </div>\cb1 \
\cb3     </div>\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
}