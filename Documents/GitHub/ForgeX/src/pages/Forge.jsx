{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red255\green255\blue254;\red0\green0\blue0;
\red144\green1\blue18;\red14\green110\blue109;\red19\green118\blue70;\red15\green112\blue1;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;\cssrgb\c0\c50196\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf0 \strokec4  \{ useState, useCallback \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'react'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ useQuery, useQueryClient \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@tanstack/react-query'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ motion \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 'framer-motion'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ base44 \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/api/base44Client'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \{ detectLanguage, translateText \} \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/lib/translation'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf6 \strokec6 ConversationList\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/components/chat/ConversationList'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf6 \strokec6 ChatView\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/components/chat/ChatView'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf6 \strokec6 EmptyChat\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/components/chat/EmptyChat'\cf0 \strokec4 ;\cb1 \
\cf2 \cb3 \strokec2 import\cf0 \strokec4  \cf6 \strokec6 VoiceRecorder\cf0 \strokec4  \cf2 \strokec2 from\cf0 \strokec4  \cf5 \strokec5 '@/components/chat/VoiceRecorder'\cf0 \strokec4 ;\cb1 \
\
\cf2 \cb3 \strokec2 export\cf0 \strokec4  \cf2 \strokec2 default\cf0 \strokec4  \cf2 \strokec2 function\cf0 \strokec4  \cf6 \strokec6 Forge\cf0 \strokec4 () \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf2 \strokec2 const\cf0 \strokec4  [activeConversation, setActiveConversation] = useState(\cf2 \strokec2 null\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [sidebarOpen, setSidebarOpen] = useState(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [voiceRecorderOpen, setVoiceRecorderOpen] = useState(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  [isProcessing, setIsProcessing] = useState(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf0 \strokec4  queryClient = useQueryClient();\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  \{ data: conversations = [] \} = useQuery(\{\cb1 \
\cb3     queryKey: [\cf5 \strokec5 'conversations'\cf0 \strokec4 ],\cb1 \
\cb3     queryFn: () => base44.entities.\cf6 \strokec6 Conversation\cf0 \strokec4 .list(\cf5 \strokec5 '-last_message_time'\cf0 \strokec4 ),\cb1 \
\cb3   \});\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  \{ data: messages = [] \} = useQuery(\{\cb1 \
\cb3     queryKey: [\cf5 \strokec5 'messages'\cf0 \strokec4 , activeConversation?.id],\cb1 \
\cb3     queryFn: () =>\cb1 \
\cb3       activeConversation\cb1 \
\cb3         ? base44.entities.\cf6 \strokec6 Message\cf0 \strokec4 .filter(\{ conversation_id: activeConversation.id \}, \cf5 \strokec5 'created_date'\cf0 \strokec4 , \cf7 \strokec7 200\cf0 \strokec4 )\cb1 \
\cb3         : [],\cb1 \
\cb3     enabled: !!activeConversation,\cb1 \
\cb3     refetchInterval: \cf7 \strokec7 3000\cf0 \strokec4 ,\cb1 \
\cb3   \});\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  sendMessage = useCallback(\cf2 \strokec2 async\cf0 \strokec4  (text) => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (!activeConversation) \cf2 \strokec2 return\cf0 \strokec4 ;\cb1 \
\cb3     setIsProcessing(\cf2 \strokec2 true\cf0 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  targetLang = activeConversation.preferred_language || \cf5 \strokec5 'en'\cf0 \strokec4 ;\cb1 \
\
\cb3     \cf8 \strokec8 // Save message instantly so it appears right away\cf0 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  newMsg = \cf2 \strokec2 await\cf0 \strokec4  base44.entities.\cf6 \strokec6 Message\cf0 \strokec4 .create(\{\cb1 \
\cb3       conversation_id: activeConversation.id,\cb1 \
\cb3       content: text,\cb1 \
\cb3       translated_content: \cf5 \strokec5 ''\cf0 \strokec4 ,\cb1 \
\cb3       original_language: \cf5 \strokec5 ''\cf0 \strokec4 ,\cb1 \
\cb3       target_language: targetLang,\cb1 \
\cb3       type: \cf5 \strokec5 'text'\cf0 \strokec4 ,\cb1 \
\cb3       sender: \cf5 \strokec5 'me'\cf0 \strokec4 ,\cb1 \
\cb3     \});\cb1 \
\
\cb3     \cf2 \strokec2 await\cf0 \strokec4  base44.entities.\cf6 \strokec6 Conversation\cf0 \strokec4 .update(activeConversation.id, \{\cb1 \
\cb3       last_message_preview: text,\cb1 \
\cb3       last_message_time: \cf2 \strokec2 new\cf0 \strokec4  \cf6 \strokec6 Date\cf0 \strokec4 ().toISOString(),\cb1 \
\cb3     \});\cb1 \
\
\cb3     queryClient.invalidateQueries(\{ queryKey: [\cf5 \strokec5 'messages'\cf0 \strokec4 , activeConversation.id] \});\cb1 \
\cb3     queryClient.invalidateQueries(\{ queryKey: [\cf5 \strokec5 'conversations'\cf0 \strokec4 ] \});\cb1 \
\cb3     setIsProcessing(\cf2 \strokec2 false\cf0 \strokec4 );\cb1 \
\
\cb3     \cf8 \strokec8 // Translate in background\cf0 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  originalLang = \cf2 \strokec2 await\cf0 \strokec4  detectLanguage(text);\cb1 \
\cb3     \cf2 \strokec2 const\cf0 \strokec4  translated = originalLang !== targetLang ? \cf2 \strokec2 await\cf0 \strokec4  translateText(text, targetLang) : text;\cb1 \
\
\cb3     \cf2 \strokec2 await\cf0 \strokec4  base44.entities.\cf6 \strokec6 Message\cf0 \strokec4 .update(newMsg.id, \{\cb1 \
\cb3       translated_content: translated,\cb1 \
\cb3       original_language: originalLang,\cb1 \
\cb3     \});\cb1 \
\
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (translated !== text) \{\cb1 \
\cb3       \cf2 \strokec2 await\cf0 \strokec4  base44.entities.\cf6 \strokec6 Conversation\cf0 \strokec4 .update(activeConversation.id, \{\cb1 \
\cb3         last_message_preview: translated,\cb1 \
\cb3       \});\cb1 \
\cb3     \}\cb1 \
\
\cb3     queryClient.invalidateQueries(\{ queryKey: [\cf5 \strokec5 'messages'\cf0 \strokec4 , activeConversation.id] \});\cb1 \
\cb3     queryClient.invalidateQueries(\{ queryKey: [\cf5 \strokec5 'conversations'\cf0 \strokec4 ] \});\cb1 \
\cb3   \}, [activeConversation, queryClient]);\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  handleLanguageChange = useCallback(\cf2 \strokec2 async\cf0 \strokec4  (langCode) => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (!activeConversation) \cf2 \strokec2 return\cf0 \strokec4 ;\cb1 \
\cb3     \cf2 \strokec2 await\cf0 \strokec4  base44.entities.\cf6 \strokec6 Conversation\cf0 \strokec4 .update(activeConversation.id, \{ preferred_language: langCode \});\cb1 \
\cb3     setActiveConversation(prev => (\{ ...prev, preferred_language: langCode \}));\cb1 \
\cb3     queryClient.invalidateQueries(\{ queryKey: [\cf5 \strokec5 'conversations'\cf0 \strokec4 ] \});\cb1 \
\cb3   \}, [activeConversation, queryClient]);\cb1 \
\
\cb3   \cf2 \strokec2 const\cf0 \strokec4  handleVoiceNoteReady = useCallback(\cf2 \strokec2 async\cf0 \strokec4  (voiceData) => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf0 \strokec4  (!activeConversation) \cf2 \strokec2 return\cf0 \strokec4 ;\cb1 \
\
\cb3     \cf2 \strokec2 const\cf0 \strokec4  newMsg = \cf2 \strokec2 await\cf0 \strokec4  base44.entities.\cf6 \strokec6 Message\cf0 \strokec4 .create(\{\cb1 \
\cb3       conversation_id: activeConversation.id,\cb1 \
\cb3       content: voiceData.transcript,\cb1 \
\cb3       translated_content: voiceData.translatedTranscript,\cb1 \
\cb3       original_language: voiceData.originalLanguage,\cb1 \
\cb3       target_language: voiceData.targetLanguage,\cb1 \
\cb3       type: \cf5 \strokec5 'voice'\cf0 \strokec4 ,\cb1 \
\cb3       audio_url: voiceData.audioUrl,\cb1 \
\cb3       transcript: voiceData.transcript,\cb1 \
\cb3       translated_transcript: voiceData.translatedTranscript,\cb1 \
\cb3       sender: \cf5 \strokec5 'me'\cf0 \strokec4 ,\cb1 \
\cb3     \});\cb1 \
\
\cb3     \cf2 \strokec2 await\cf0 \strokec4  base44.entities.\cf6 \strokec6 Conversation\cf0 \strokec4 .update(activeConversation.id, \{\cb1 \
\cb3       last_message_preview: \cf5 \strokec5 `\uc0\u55356 \u57252  \cf0 \strokec4 $\{voiceData.translatedTranscript || voiceData.transcript\}\cf5 \strokec5 `\cf0 \strokec4 ,\cb1 \
\cb3       last_message_time: \cf2 \strokec2 new\cf0 \strokec4  \cf6 \strokec6 Date\cf0 \strokec4 ().toISOString(),\cb1 \
\cb3     \});\cb1 \
\
\cb3     queryClient.invalidateQueries(\{ queryKey: [\cf5 \strokec5 'messages'\cf0 \strokec4 , activeConversation.id] \});\cb1 \
\cb3     queryClient.invalidateQueries(\{ queryKey: [\cf5 \strokec5 'conversations'\cf0 \strokec4 ] \});\cb1 \
\cb3   \}, [activeConversation, queryClient]);\cb1 \
\
\cb3   \cf2 \strokec2 return\cf0 \strokec4  (\cb1 \
\cb3     <div className=\cf5 \strokec5 "h-screen flex bg-background relative overflow-hidden"\cf0 \strokec4 >\cb1 \
\cb3       \{\cf8 \strokec8 /* Animated background orbs \'97 light/dark responsive */\cf0 \strokec4 \}\cb1 \
\cb3       <div className=\cf5 \strokec5 "absolute inset-0 pointer-events-none overflow-hidden"\cf0 \strokec4 >\cb1 \
\cb3         <motion.div\cb1 \
\cb3           animate=\{\{ scale: [\cf7 \strokec7 1\cf0 \strokec4 , \cf7 \strokec7 1.2\cf0 \strokec4 , \cf7 \strokec7 1\cf0 \strokec4 ], x: [\cf7 \strokec7 0\cf0 \strokec4 , \cf7 \strokec7 30\cf0 \strokec4 , -\cf7 \strokec7 20\cf0 \strokec4 , \cf7 \strokec7 0\cf0 \strokec4 ], y: [\cf7 \strokec7 0\cf0 \strokec4 , -\cf7 \strokec7 20\cf0 \strokec4 , \cf7 \strokec7 10\cf0 \strokec4 , \cf7 \strokec7 0\cf0 \strokec4 ] \}\}\cb1 \
\cb3           transition=\{\{ duration: \cf7 \strokec7 12\cf0 \strokec4 , repeat: \cf6 \strokec6 Infinity\cf0 \strokec4 , ease: \cf5 \strokec5 'easeInOut'\cf0 \strokec4  \}\}\cb1 \
\cb3           className=\cf5 \strokec5 "absolute top-[15%] left-[10%] w-[400px] h-[400px] rounded-full blur-[120px]"\cf0 \cb1 \strokec4 \
\cb3           style=\{\{ background: \cf5 \strokec5 'var(--orb-1)'\cf0 \strokec4  \}\}\cb1 \
\cb3         />\cb1 \
\cb3         <motion.div\cb1 \
\cb3           animate=\{\{ scale: [\cf7 \strokec7 1\cf0 \strokec4 , \cf7 \strokec7 1.15\cf0 \strokec4 , \cf7 \strokec7 0.9\cf0 \strokec4 , \cf7 \strokec7 1\cf0 \strokec4 ], x: [\cf7 \strokec7 0\cf0 \strokec4 , -\cf7 \strokec7 40\cf0 \strokec4 , \cf7 \strokec7 30\cf0 \strokec4 , \cf7 \strokec7 0\cf0 \strokec4 ], y: [\cf7 \strokec7 0\cf0 \strokec4 , \cf7 \strokec7 20\cf0 \strokec4 , -\cf7 \strokec7 30\cf0 \strokec4 , \cf7 \strokec7 0\cf0 \strokec4 ] \}\}\cb1 \
\cb3           transition=\{\{ duration: \cf7 \strokec7 15\cf0 \strokec4 , repeat: \cf6 \strokec6 Infinity\cf0 \strokec4 , ease: \cf5 \strokec5 'easeInOut'\cf0 \strokec4 , delay: \cf7 \strokec7 3\cf0 \strokec4  \}\}\cb1 \
\cb3           className=\cf5 \strokec5 "absolute bottom-[20%] right-[15%] w-[350px] h-[350px] rounded-full blur-[120px]"\cf0 \cb1 \strokec4 \
\cb3           style=\{\{ background: \cf5 \strokec5 'var(--orb-2)'\cf0 \strokec4  \}\}\cb1 \
\cb3         />\cb1 \
\cb3         <motion.div\cb1 \
\cb3           animate=\{\{ scale: [\cf7 \strokec7 1\cf0 \strokec4 , \cf7 \strokec7 1.1\cf0 \strokec4 , \cf7 \strokec7 1.25\cf0 \strokec4 , \cf7 \strokec7 1\cf0 \strokec4 ], x: [\cf7 \strokec7 0\cf0 \strokec4 , -\cf7 \strokec7 20\cf0 \strokec4 , \cf7 \strokec7 40\cf0 \strokec4 , \cf7 \strokec7 0\cf0 \strokec4 ], y: [\cf7 \strokec7 0\cf0 \strokec4 , \cf7 \strokec7 30\cf0 \strokec4 , -\cf7 \strokec7 10\cf0 \strokec4 , \cf7 \strokec7 0\cf0 \strokec4 ] \}\}\cb1 \
\cb3           transition=\{\{ duration: \cf7 \strokec7 18\cf0 \strokec4 , repeat: \cf6 \strokec6 Infinity\cf0 \strokec4 , ease: \cf5 \strokec5 'easeInOut'\cf0 \strokec4 , delay: \cf7 \strokec7 7\cf0 \strokec4  \}\}\cb1 \
\cb3           className=\cf5 \strokec5 "absolute top-[50%] left-[40%] w-[300px] h-[300px] rounded-full blur-[100px]"\cf0 \cb1 \strokec4 \
\cb3           style=\{\{ background: \cf5 \strokec5 'var(--orb-3)'\cf0 \strokec4  \}\}\cb1 \
\cb3         />\cb1 \
\cb3       </div>\cb1 \
\
\cb3       <\cf6 \strokec6 ConversationList\cf0 \cb1 \strokec4 \
\cb3         conversations=\{conversations\}\cb1 \
\cb3         activeId=\{activeConversation?.id\}\cb1 \
\cb3         onSelect=\{setActiveConversation\}\cb1 \
\cb3         isOpen=\{sidebarOpen\}\cb1 \
\cb3         onClose=\{() => setSidebarOpen(\cf2 \strokec2 false\cf0 \strokec4 )\}\cb1 \
\cb3       />\cb1 \
\
\cb3       <div className=\cf5 \strokec5 "flex-1 flex flex-col relative z-10"\cf0 \strokec4 >\cb1 \
\cb3         \{activeConversation ? (\cb1 \
\cb3           <\cf6 \strokec6 ChatView\cf0 \cb1 \strokec4 \
\cb3             conversation=\{activeConversation\}\cb1 \
\cb3             messages=\{messages\}\cb1 \
\cb3             onSendMessage=\{sendMessage\}\cb1 \
\cb3             onStartRecording=\{() => setVoiceRecorderOpen(\cf2 \strokec2 true\cf0 \strokec4 )\}\cb1 \
\cb3             isProcessing=\{isProcessing\}\cb1 \
\cb3             onBack=\{() => setActiveConversation(\cf2 \strokec2 null\cf0 \strokec4 )\}\cb1 \
\cb3             onLanguageChange=\{handleLanguageChange\}\cb1 \
\cb3           />\cb1 \
\cb3         ) : (\cb1 \
\cb3           <\cf6 \strokec6 EmptyChat\cf0 \strokec4  onMenuClick=\{() => setSidebarOpen(\cf2 \strokec2 true\cf0 \strokec4 )\} />\cb1 \
\cb3         )\}\cb1 \
\cb3       </div>\cb1 \
\
\cb3       <\cf6 \strokec6 VoiceRecorder\cf0 \cb1 \strokec4 \
\cb3         isOpen=\{voiceRecorderOpen\}\cb1 \
\cb3         onClose=\{() => setVoiceRecorderOpen(\cf2 \strokec2 false\cf0 \strokec4 )\}\cb1 \
\cb3         onVoiceNoteReady=\{handleVoiceNoteReady\}\cb1 \
\cb3         targetLanguage=\{activeConversation?.preferred_language || \cf5 \strokec5 'en'\cf0 \strokec4 \}\cb1 \
\cb3       />\cb1 \
\cb3     </div>\cb1 \
\cb3   );\cb1 \
\cb3 \}\cb1 \
}