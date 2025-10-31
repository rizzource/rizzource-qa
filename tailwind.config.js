export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,jsx}",
		"./components/**/*.{js,jsx}",
		"./app/**/*.{js,jsx}",
		"./src/**/*.{js,jsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				'serif': ['Merriweather', 'Georgia', 'serif'],
				'merriweather': ['Merriweather', 'Georgia', 'serif'],
				'inter': ['Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'body': ['1rem', { lineHeight: '1.6' }],
				'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
				'h2': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
				'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
				'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
				'h5': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],
				'h6': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
			},
			spacing: {
				'1': 'var(--space-1)',
				'2': 'var(--space-2)',
				'3': 'var(--space-3)',
				'4': 'var(--space-4)',
				'5': 'var(--space-5)',
				'6': 'var(--space-6)',
				'7': 'var(--space-7)',
				'8': 'var(--space-8)',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				brand: {
					primary: 'hsl(var(--brand-primary))',
					secondary: 'hsl(var(--brand-secondary))',
					accent: 'hsl(var(--brand-accent))',
				},
				surface: {
					DEFAULT: 'hsl(var(--surface))',
					alt: 'hsl(var(--surface-alt))',
				},
				text: {
					DEFAULT: 'hsl(var(--text))',
					muted: 'hsl(var(--text-muted))',
				},
				link: {
					DEFAULT: 'hsl(var(--link))',
					hover: 'hsl(var(--link-hover))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					green: 'hsl(var(--primary-green))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					green: 'hsl(var(--secondary-green))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				gold: {
					primary: 'hsl(var(--gold-primary))',
					secondary: 'hsl(var(--gold-secondary))',
					accent: 'hsl(var(--gold-accent))',
					light: 'hsl(var(--gold-light))',
					dark: 'hsl(var(--gold-dark))'
				},
				neutral: {
					light: 'hsl(var(--neutral-light))',
					dark: 'hsl(var(--neutral-dark))'
				},
				'light-green': 'hsl(var(--light-green))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
			},
			letterSpacing: {
				'tight': '-0.02em',
				'normal': '0',
				'wide': '0.02em',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'shimmer': 'shimmer 1.5s infinite',
				'fade-in': 'fadeIn 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};