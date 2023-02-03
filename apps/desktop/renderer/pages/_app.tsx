import type { EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ActionDock } from '../components/ActionDock';
import WindowFrame from '../components/WindowFrame';
import createEmotionCache from '../lib/create-emotion-cache';
import theme from '../lib/theme';
import '../styles/globals.css';

const clientSideEmotionCache = createEmotionCache();

type MyAppProps = AppProps & {
	emotionCache?: EmotionCache;
};

export default function MyApp(props: MyAppProps) {
	const { Component, pageProps, emotionCache = clientSideEmotionCache } = props;

	return (
		<CacheProvider value={emotionCache}>
			<Head>
				<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
			</Head>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<div className="flex flex-col h-screen w-screen">
					<WindowFrame />
					<main className="flex-1 pb-20">
						<Component {...pageProps} />
					</main>
					<div className="flex-1 max-h-16">
						<ActionDock />
					</div>
				</div>
			</ThemeProvider>
		</CacheProvider>
	);
}
