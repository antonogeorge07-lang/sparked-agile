{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red15\green112\blue1;\red255\green255\blue254;\red0\green0\blue0;
\red144\green1\blue18;\red14\green110\blue109;\red0\green0\blue255;}
{\*\expandedcolortbl;;\cssrgb\c0\c50196\c0;\cssrgb\c100000\c100000\c99608;\cssrgb\c0\c0\c0;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c0\c0\c100000;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 /** @type \{import('tailwindcss').Config\} */\cf0 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf0 \cb3 module.exports = \{\cb1 \
\cb3     darkMode: [\cf5 \strokec5 "class"\cf0 \strokec4 ],\cb1 \
\cb3     content: [\cf5 \strokec5 "./index.html"\cf0 \strokec4 , \cf5 \strokec5 "./src/**/*.\{ts,tsx,js,jsx\}"\cf0 \strokec4 ],\cb1 \
\cb3   theme: \{\cb1 \
\cb3     extend: \{\cb1 \
\cb3       borderRadius: \{\cb1 \
\cb3         lg: \cf5 \strokec5 'var(--radius)'\cf0 \strokec4 ,\cb1 \
\cb3         md: \cf5 \strokec5 'calc(var(--radius) - 2px)'\cf0 \strokec4 ,\cb1 \
\cb3         sm: \cf5 \strokec5 'calc(var(--radius) - 4px)'\cf0 \cb1 \strokec4 \
\cb3       \},\cb1 \
\cb3       colors: \{\cb1 \
\cb3         background: \cf5 \strokec5 'hsl(var(--background))'\cf0 \strokec4 ,\cb1 \
\cb3         foreground: \cf5 \strokec5 'hsl(var(--foreground))'\cf0 \strokec4 ,\cb1 \
\cb3         card: \{\cb1 \
\cb3           \cf6 \cb3 \strokec6 DEFAULT\cf0 \cb3 \strokec4 : \cf5 \strokec5 'hsl(var(--card))'\cf0 \strokec4 ,\cb1 \
\cb3           foreground: \cf5 \strokec5 'hsl(var(--card-foreground))'\cf0 \cb1 \strokec4 \
\cb3         \},\cb1 \
\cb3         popover: \{\cb1 \
\cb3           \cf6 \cb3 \strokec6 DEFAULT\cf0 \cb3 \strokec4 : \cf5 \strokec5 'hsl(var(--popover))'\cf0 \strokec4 ,\cb1 \
\cb3           foreground: \cf5 \strokec5 'hsl(var(--popover-foreground))'\cf0 \cb1 \strokec4 \
\cb3         \},\cb1 \
\cb3         primary: \{\cb1 \
\cb3           \cf6 \cb3 \strokec6 DEFAULT\cf0 \cb3 \strokec4 : \cf5 \strokec5 'hsl(var(--primary))'\cf0 \strokec4 ,\cb1 \
\cb3           foreground: \cf5 \strokec5 'hsl(var(--primary-foreground))'\cf0 \cb1 \strokec4 \
\cb3         \},\cb1 \
\cb3         secondary: \{\cb1 \
\cb3           \cf6 \cb3 \strokec6 DEFAULT\cf0 \cb3 \strokec4 : \cf5 \strokec5 'hsl(var(--secondary))'\cf0 \strokec4 ,\cb1 \
\cb3           foreground: \cf5 \strokec5 'hsl(var(--secondary-foreground))'\cf0 \cb1 \strokec4 \
\cb3         \},\cb1 \
\cb3         muted: \{\cb1 \
\cb3           \cf6 \cb3 \strokec6 DEFAULT\cf0 \cb3 \strokec4 : \cf5 \strokec5 'hsl(var(--muted))'\cf0 \strokec4 ,\cb1 \
\cb3           foreground: \cf5 \strokec5 'hsl(var(--muted-foreground))'\cf0 \cb1 \strokec4 \
\cb3         \},\cb1 \
\cb3         accent: \{\cb1 \
\cb3           \cf6 \cb3 \strokec6 DEFAULT\cf0 \cb3 \strokec4 : \cf5 \strokec5 'hsl(var(--accent))'\cf0 \strokec4 ,\cb1 \
\cb3           foreground: \cf5 \strokec5 'hsl(var(--accent-foreground))'\cf0 \cb1 \strokec4 \
\cb3         \},\cb1 \
\cb3         destructive: \{\cb1 \
\cb3           \cf6 \cb3 \strokec6 DEFAULT\cf0 \cb3 \strokec4 : \cf5 \strokec5 'hsl(var(--destructive))'\cf0 \strokec4 ,\cb1 \
\cb3           foreground: \cf5 \strokec5 'hsl(var(--destructive-foreground))'\cf0 \cb1 \strokec4 \
\cb3         \},\cb1 \
\cb3         border: \cf5 \strokec5 'hsl(var(--border))'\cf0 \strokec4 ,\cb1 \
\cb3         input: \cf5 \strokec5 'hsl(var(--input))'\cf0 \strokec4 ,\cb1 \
\cb3         ring: \cf5 \strokec5 'hsl(var(--ring))'\cf0 \strokec4 ,\cb1 \
\cb3         chart: \{\cb1 \
\cb3           \cf5 \strokec5 '1'\cf0 \strokec4 : \cf5 \strokec5 'hsl(var(--chart-1))'\cf0 \strokec4 ,\cb1 \
\cb3           \cf5 \strokec5 '2'\cf0 \strokec4 : \cf5 \strokec5 'hsl(var(--chart-2))'\cf0 \strokec4 ,\cb1 \
\cb3           \cf5 \strokec5 '3'\cf0 \strokec4 : \cf5 \strokec5 'hsl(var(--chart-3))'\cf0 \strokec4 ,\cb1 \
\cb3           \cf5 \strokec5 '4'\cf0 \strokec4 : \cf5 \strokec5 'hsl(var(--chart-4))'\cf0 \strokec4 ,\cb1 \
\cb3           \cf5 \strokec5 '5'\cf0 \strokec4 : \cf5 \strokec5 'hsl(var(--chart-5))'\cf0 \cb1 \strokec4 \
\cb3         \},\cb1 \
\cb3         sidebar: \{\cb1 \
\cb3           \cf6 \cb3 \strokec6 DEFAULT\cf0 \cb3 \strokec4 : \cf5 \strokec5 'hsl(var(--sidebar-background))'\cf0 \strokec4 ,\cb1 \
\cb3           foreground: \cf5 \strokec5 'hsl(var(--sidebar-foreground))'\cf0 \strokec4 ,\cb1 \
\cb3           primary: \cf5 \strokec5 'hsl(var(--sidebar-primary))'\cf0 \strokec4 ,\cb1 \
\cb3           \cf5 \strokec5 'primary-foreground'\cf0 \strokec4 : \cf5 \strokec5 'hsl(var(--sidebar-primary-foreground))'\cf0 \strokec4 ,\cb1 \
\cb3           accent: \cf5 \strokec5 'hsl(var(--sidebar-accent))'\cf0 \strokec4 ,\cb1 \
\cb3           \cf5 \strokec5 'accent-foreground'\cf0 \strokec4 : \cf5 \strokec5 'hsl(var(--sidebar-accent-foreground))'\cf0 \strokec4 ,\cb1 \
\cb3           border: \cf5 \strokec5 'hsl(var(--sidebar-border))'\cf0 \strokec4 ,\cb1 \
\cb3           ring: \cf5 \strokec5 'hsl(var(--sidebar-ring))'\cf0 \cb1 \strokec4 \
\cb3         \}\cb1 \
\cb3       \},\cb1 \
\cb3       fontFamily: \{\cb1 \
\cb3         heading: [\cf5 \strokec5 'var(--font-heading)'\cf0 \strokec4 ],\cb1 \
\cb3         body: [\cf5 \strokec5 'var(--font-body)'\cf0 \strokec4 ],\cb1 \
\cb3         display: [\cf5 \strokec5 'var(--font-display)'\cf0 \strokec4 ],\cb1 \
\cb3         mono: [\cf5 \strokec5 'var(--font-mono)'\cf0 \strokec4 ]\cb1 \
\cb3       \},\cb1 \
\cb3       keyframes: \{\cb1 \
\cb3         \cf5 \strokec5 'accordion-down'\cf0 \strokec4 : \{\cb1 \
\cb3           \cf7 \cb3 \strokec7 from\cf0 \cb3 \strokec4 : \{\cb1 \
\cb3             height: \cf5 \strokec5 '0'\cf0 \cb1 \strokec4 \
\cb3           \},\cb1 \
\cb3           to: \{\cb1 \
\cb3             height: \cf5 \strokec5 'var(--radix-accordion-content-height)'\cf0 \cb1 \strokec4 \
\cb3           \}\cb1 \
\cb3         \},\cb1 \
\cb3         \cf5 \strokec5 'accordion-up'\cf0 \strokec4 : \{\cb1 \
\cb3           \cf7 \cb3 \strokec7 from\cf0 \cb3 \strokec4 : \{\cb1 \
\cb3             height: \cf5 \strokec5 'var(--radix-accordion-content-height)'\cf0 \cb1 \strokec4 \
\cb3           \},\cb1 \
\cb3           to: \{\cb1 \
\cb3             height: \cf5 \strokec5 '0'\cf0 \cb1 \strokec4 \
\cb3           \}\cb1 \
\cb3         \}\cb1 \
\cb3       \},\cb1 \
\cb3       animation: \{\cb1 \
\cb3         \cf5 \strokec5 'accordion-down'\cf0 \strokec4 : \cf5 \strokec5 'accordion-down 0.2s ease-out'\cf0 \strokec4 ,\cb1 \
\cb3         \cf5 \strokec5 'accordion-up'\cf0 \strokec4 : \cf5 \strokec5 'accordion-up 0.2s ease-out'\cf0 \cb1 \strokec4 \
\cb3       \}\cb1 \
\cb3     \}\cb1 \
\cb3   \},\cb1 \
\cb3   plugins: [require(\cf5 \strokec5 "tailwindcss-animate"\cf0 \strokec4 )],\cb1 \
\cb3 \}\cb1 \
\
}