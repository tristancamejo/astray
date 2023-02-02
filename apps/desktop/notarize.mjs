// @ts-check
import { notarize } from '@electron/notarize';

export default async function notarizing(context) {
	const { electronPlatformName, appOutDir } = context;
	if (electronPlatformName !== 'darwin') {
		return;
	}

	const appName = context.packager.appInfo.productFilename;

	return await notarize({
		appBundleId: 'pw.evie.astray',
		appPath: `${appOutDir}/${appName}.app`,
		appleId: `@keychain:AC_USERNAME`,
		appleIdPassword: `@keychain:AC_PASSWORD`,
	});
}
