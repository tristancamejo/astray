import type { EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ActionDock } from '../components/ActionDock';
import WindowFrame from '../components/WindowFrame'; // This is the top of the window (the title bar)
import createEmotionCache from '../lib/create-emotion-cache';
import theme from '../lib/theme';
import '../styles/globals.css';
import styles from './App.module.scss';

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
				<div className={styles.app}>
					<div className={styles.app__windowFrame}>
						<WindowFrame />
					</div>
					<div className={styles.app__content}>
						<Component {...pageProps} />
					</div>
					<div className={styles.app__actionDock}>
						<ActionDock />
					</div>
				</div>
			</ThemeProvider>
		</CacheProvider>
	);
}
