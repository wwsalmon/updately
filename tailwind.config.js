module.exports = {
    purge: [
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
        },
        variants: {
            extend: {
                borderColor: ['focus-visible'],
                borderWidth: ['focus-visible'],
            },
        },   
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
    darkMode: 'class',
}