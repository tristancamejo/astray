import { styled } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Head from 'next/head';
import React from 'react';
import Link from '../components/Link';

const Root = styled('div')(({ theme }) => {
	return {
		textAlign: 'center',
		paddingTop: theme.spacing(4),
	};
});

function Next() {
	return (
		<React.Fragment>
			<Head>
				<title>Next - Nextron (with-typescript-material-ui)</title>
			</Head>
			<Root>
				<Typography variant="h4" gutterBottom>
					Material-UI
				</Typography>
				<Typography variant="subtitle1" gutterBottom>
					with Nextron
				</Typography>
				<Typography gutterBottom>
					<Link href="/index">Go to the home page</Link>
				</Typography>
				<Button variant="contained" color="primary">
					Do nothing button
				</Button>
			</Root>
		</React.Fragment>
	);
}

export default Next;
