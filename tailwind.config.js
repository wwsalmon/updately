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
                },
                tblue: "#0026ff",
            },
        }  
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
    darkMode: 'class',
}