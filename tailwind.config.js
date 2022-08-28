module.exports = {
    content: [
        './**/*.html',
        './**/*.tsx',
    ],
    theme: {
        extend: {
            colors: {    
                gray: {
                    900: '#121212',
                }
            },
        }  
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
    darkMode: 'class',
}