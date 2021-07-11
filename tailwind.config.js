module.exports = {
    purge: [
        './**/*.html',
        './**/*.tsx',
    ],
    theme: {
        extend: {},
        colors: {
            transparent: 'transparent',
            black: '#000',
            white: '#fff',      
            gray: {
              100: '#f3f4f6',
              900: '#121212',
            },
            red: {
                500: '#ef4444',
            },
            blue: {
                300: '#93c5fd',
            }
        },
    },
    variants: {
        extend: {
            borderColor: ['focus-visible'],
            borderWidth: ['focus-visible'],
        },   
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
    darkMode: 'class',
}