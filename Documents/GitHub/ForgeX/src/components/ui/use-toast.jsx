{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red15\green112\blue1;\red255\green255\blue254;\red0\green0\blue0;
\red0\green0\blue255;\red144\green1\blue18;\red14\green110\blue109;\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c0\c50196\c0;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c0\c0\c100000;\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 // Inspired by react-hot-toast library\cf0 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 import\cf0 \strokec4  \{ useState, useEffect \} \cf5 \strokec5 from\cf0 \strokec4  \cf6 \strokec6 "react"\cf0 \strokec4 ;\cb1 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf7 \strokec7 TOAST_LIMIT\cf0 \strokec4  = \cf8 \cb3 \strokec8 20\cf0 \cb3 \strokec4 ;\cb1 \
\cf5 \cb3 \strokec5 const\cf0 \strokec4  \cf7 \strokec7 TOAST_REMOVE_DELAY\cf0 \strokec4  = \cf8 \cb3 \strokec8 1000000\cf0 \cb3 \strokec4 ;\cb1 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  actionTypes = \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf7 \strokec7 ADD_TOAST\cf0 \strokec4 : \cf6 \strokec6 "ADD_TOAST"\cf0 \strokec4 ,\cb1 \
\cb3   \cf7 \strokec7 UPDATE_TOAST\cf0 \strokec4 : \cf6 \strokec6 "UPDATE_TOAST"\cf0 \strokec4 ,\cb1 \
\cb3   \cf7 \strokec7 DISMISS_TOAST\cf0 \strokec4 : \cf6 \strokec6 "DISMISS_TOAST"\cf0 \strokec4 ,\cb1 \
\cb3   \cf7 \strokec7 REMOVE_TOAST\cf0 \strokec4 : \cf6 \strokec6 "REMOVE_TOAST"\cf0 \strokec4 ,\cb1 \
\cb3 \};\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 let\cf0 \strokec4  count = \cf8 \cb3 \strokec8 0\cf0 \cb3 \strokec4 ;\cb1 \
\
\cf5 \cb3 \strokec5 function\cf0 \strokec4  genId() \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   count = (count + \cf8 \cb3 \strokec8 1\cf0 \cb3 \strokec4 ) % \cf7 \strokec7 Number\cf0 \strokec4 .\cf7 \strokec7 MAX_VALUE\cf0 \strokec4 ;\cb1 \
\cb3   \cf5 \strokec5 return\cf0 \strokec4  count.toString();\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  toastTimeouts = \cf5 \strokec5 new\cf0 \strokec4  \cf7 \strokec7 Map\cf0 \strokec4 ();\cb1 \
\
\cf5 \cb3 \strokec5 const\cf0 \strokec4  addToRemoveQueue = (toastId) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 if\cf0 \strokec4  (toastTimeouts.has(toastId)) \{\cb1 \
\cb3     \cf5 \strokec5 return\cf0 \strokec4 ;\cb1 \
\cb3   \}\cb1 \
\
\cb3   \cf5 \strokec5 const\cf0 \strokec4  timeout = setTimeout(() => \{\cb1 \
\cb3     toastTimeouts.\cf5 \strokec5 delete\cf0 \strokec4 (toastId);\cb1 \
\cb3     dispatch(\{\cb1 \
\cb3       type: actionTypes.\cf7 \strokec7 REMOVE_TOAST\cf0 \strokec4 ,\cb1 \
\cb3       toastId,\cb1 \
\cb3     \});\cb1 \
\cb3   \}, \cf7 \strokec7 TOAST_REMOVE_DELAY\cf0 \strokec4 );\cb1 \
\
\cb3   toastTimeouts.\cf5 \strokec5 set\cf0 \strokec4 (toastId, timeout);\cb1 \
\cb3 \};\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  _clearFromRemoveQueue = (toastId) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 const\cf0 \strokec4  timeout = toastTimeouts.\cf5 \strokec5 get\cf0 \strokec4 (toastId);\cb1 \
\cb3   \cf5 \strokec5 if\cf0 \strokec4  (timeout) \{\cb1 \
\cb3     clearTimeout(timeout);\cb1 \
\cb3     toastTimeouts.\cf5 \strokec5 delete\cf0 \strokec4 (toastId);\cb1 \
\cb3   \}\cb1 \
\cb3 \};\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf0 \strokec4  \cf5 \strokec5 const\cf0 \strokec4  reducer = (state, action) => \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 switch\cf0 \strokec4  (action.type) \{\cb1 \
\cb3     \cf5 \strokec5 case\cf0 \strokec4  actionTypes.\cf7 \strokec7 ADD_TOAST\cf0 \strokec4 :\cb1 \
\cb3       \cf5 \strokec5 return\cf0 \strokec4  \{\cb1 \
\cb3         ...state,\cb1 \
\cb3         toasts: [action.toast, ...state.toasts].slice(\cf8 \cb3 \strokec8 0\cf0 \cb3 \strokec4 , \cf7 \strokec7 TOAST_LIMIT\cf0 \strokec4 ),\cb1 \
\cb3       \};\cb1 \
\
\cb3     \cf5 \strokec5 case\cf0 \strokec4  actionTypes.\cf7 \strokec7 UPDATE_TOAST\cf0 \strokec4 :\cb1 \
\cb3       \cf5 \strokec5 return\cf0 \strokec4  \{\cb1 \
\cb3         ...state,\cb1 \
\cb3         toasts: state.toasts.map((t) =>\cb1 \
\cb3           t.id === action.toast.id ? \{ ...t, ...action.toast \} : t\cb1 \
\cb3         ),\cb1 \
\cb3       \};\cb1 \
\
\cb3     \cf5 \strokec5 case\cf0 \strokec4  actionTypes.\cf7 \strokec7 DISMISS_TOAST\cf0 \strokec4 : \{\cb1 \
\cb3       \cf5 \strokec5 const\cf0 \strokec4  \{ toastId \} = action;\cb1 \
\
\cb3       \cf2 \cb3 \strokec2 // ! Side effects ! - This could be extracted into a dismissToast() action,\cf0 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 // but I'll keep it here for simplicity\cf0 \cb1 \strokec4 \
\cb3       \cf5 \strokec5 if\cf0 \strokec4  (toastId) \{\cb1 \
\cb3         addToRemoveQueue(toastId);\cb1 \
\cb3       \} \cf5 \strokec5 else\cf0 \strokec4  \{\cb1 \
\cb3         state.toasts.forEach((toast) => \{\cb1 \
\cb3           addToRemoveQueue(toast.id);\cb1 \
\cb3         \});\cb1 \
\cb3       \}\cb1 \
\
\cb3       \cf5 \strokec5 return\cf0 \strokec4  \{\cb1 \
\cb3         ...state,\cb1 \
\cb3         toasts: state.toasts.map((t) =>\cb1 \
\cb3           t.id === toastId || toastId === \cf5 \strokec5 undefined\cf0 \cb1 \strokec4 \
\cb3             ? \{\cb1 \
\cb3                 ...t,\cb1 \
\cb3                 open: \cf5 \strokec5 false\cf0 \strokec4 ,\cb1 \
\cb3               \}\cb1 \
\cb3             : t\cb1 \
\cb3         ),\cb1 \
\cb3       \};\cb1 \
\cb3     \}\cb1 \
\cb3     \cf5 \strokec5 case\cf0 \strokec4  actionTypes.\cf7 \strokec7 REMOVE_TOAST\cf0 \strokec4 :\cb1 \
\cb3       \cf5 \strokec5 if\cf0 \strokec4  (action.toastId === \cf5 \strokec5 undefined\cf0 \strokec4 ) \{\cb1 \
\cb3         \cf5 \strokec5 return\cf0 \strokec4  \{\cb1 \
\cb3           ...state,\cb1 \
\cb3           toasts: [],\cb1 \
\cb3         \};\cb1 \
\cb3       \}\cb1 \
\cb3       \cf5 \strokec5 return\cf0 \strokec4  \{\cb1 \
\cb3         ...state,\cb1 \
\cb3         toasts: state.toasts.filter((t) => t.id !== action.toastId),\cb1 \
\cb3       \};\cb1 \
\cb3   \}\cb1 \
\cb3 \};\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf0 \strokec4  listeners = [];\cb1 \
\
\cf5 \cb3 \strokec5 let\cf0 \strokec4  memoryState = \{ toasts: [] \};\cb1 \
\
\cf5 \cb3 \strokec5 function\cf0 \strokec4  dispatch(action) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   memoryState = reducer(memoryState, action);\cb1 \
\cb3   listeners.forEach((listener) => \{\cb1 \
\cb3     listener(memoryState);\cb1 \
\cb3   \});\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 function\cf0 \strokec4  toast(\{ ...props \}) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 const\cf0 \strokec4  id = genId();\cb1 \
\
\cb3   \cf5 \strokec5 const\cf0 \strokec4  update = (props) =>\cb1 \
\cb3     dispatch(\{\cb1 \
\cb3       type: actionTypes.\cf7 \strokec7 UPDATE_TOAST\cf0 \strokec4 ,\cb1 \
\cb3       toast: \{ ...props, id \},\cb1 \
\cb3     \});\cb1 \
\
\cb3   \cf5 \strokec5 const\cf0 \strokec4  dismiss = () =>\cb1 \
\cb3     dispatch(\{ type: actionTypes.\cf7 \strokec7 DISMISS_TOAST\cf0 \strokec4 , toastId: id \});\cb1 \
\
\cb3   dispatch(\{\cb1 \
\cb3     type: actionTypes.\cf7 \strokec7 ADD_TOAST\cf0 \strokec4 ,\cb1 \
\cb3     toast: \{\cb1 \
\cb3       ...props,\cb1 \
\cb3       id,\cb1 \
\cb3       open: \cf5 \strokec5 true\cf0 \strokec4 ,\cb1 \
\cb3       onOpenChange: (open) => \{\cb1 \
\cb3         \cf5 \strokec5 if\cf0 \strokec4  (!open) dismiss();\cb1 \
\cb3       \},\cb1 \
\cb3     \},\cb1 \
\cb3   \});\cb1 \
\
\cb3   \cf5 \strokec5 return\cf0 \strokec4  \{\cb1 \
\cb3     id,\cb1 \
\cb3     dismiss,\cb1 \
\cb3     update,\cb1 \
\cb3   \};\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 function\cf0 \strokec4  useToast() \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3   \cf5 \strokec5 const\cf0 \strokec4  [state, setState] = useState(memoryState);\cb1 \
\
\cb3   useEffect(() => \{\cb1 \
\cb3     listeners.push(setState);\cb1 \
\cb3     \cf5 \strokec5 return\cf0 \strokec4  () => \{\cb1 \
\cb3       \cf5 \strokec5 const\cf0 \strokec4  index = listeners.indexOf(setState);\cb1 \
\cb3       \cf5 \strokec5 if\cf0 \strokec4  (index > -\cf8 \cb3 \strokec8 1\cf0 \cb3 \strokec4 ) \{\cb1 \
\cb3         listeners.splice(index, \cf8 \cb3 \strokec8 1\cf0 \cb3 \strokec4 );\cb1 \
\cb3       \}\cb1 \
\cb3     \};\cb1 \
\cb3   \}, [state]);\cb1 \
\
\cb3   \cf5 \strokec5 return\cf0 \strokec4  \{\cb1 \
\cb3     ...state,\cb1 \
\cb3     toast,\cb1 \
\cb3     dismiss: (toastId) => dispatch(\{ type: actionTypes.\cf7 \strokec7 DISMISS_TOAST\cf0 \strokec4 , toastId \}),\cb1 \
\cb3   \};\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 export\cf0 \strokec4  \{ useToast, toast \}; \cb1 \
}