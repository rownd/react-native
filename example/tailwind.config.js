const { plugin } = require('twrnc');

module.exports = {
  content: [
    './rownd-rn/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        button: {
          borderRadius: 10,
          padding: 10,
          marginTop: 20,
          marginBottom: 30,
          elevation: 0,
          backgroundColor: '#5b0ae0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        buttonDisabled: {
          backgroundColor: '#eee',
        },
        buttonPressed: {
          opacity: 0.5,
        },
        buttonContent: {
          textAlign: 'center',
          fontSize: 18,
          color: '#fff'
        },
        buttonText: {
          marginLeft: 10,
          paddingLeft: 10,
          fontSize: 18,
        },
        buttonTextInner: {
          fontSize: 18,
        },
        buttonDisabledText: {
          color: '#8e8e8e'
        },
        buttonSubmitting: {
          backgroundColor: '#2f0492',
          color: '#c7c7c7',
        },
      })
    })
  ],
  variants: ['dark'],
  corePlugins: require('tailwind-rn/unsupported-core-plugins'),
}
