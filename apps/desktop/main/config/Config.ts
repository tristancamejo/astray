import * as fs from 'node:fs';
import * as path from 'node:path';
import { z } from 'zod';
import { ASTRAY_FOLDER } from '../Constants';
import { EventBus } from '../events/bus/EventBus';
import { DefaultConfig } from './_defaults';
import { ConfigSpec } from './_spec';

export class Configuration {
	private settings: z.infer<typeof ConfigSpec>;

	public constructor(private bus: EventBus) {
		(async () => {
			this.settings = await this.loadConfig();
		})();
	}

	private async loadConfig(): Promise<z.infer<typeof ConfigSpec>> {
		let config = DefaultConfig as unknown;
		try {
			const savedConfig = await fs.promises.readFile(path.join(ASTRAY_FOLDER, 'config.json'), 'utf-8');
			config = JSON.parse(savedConfig);
		} catch (e) {
			console.log('No config file found, using defaults');
		}

		const validatedConfig = await ConfigSpec.parseAsync(config);
		return validatedConfig;
	}

	public async getSettings(): Promise<z.infer<typeof ConfigSpec>> {
		if (!this.settings) {
			this.settings = await this.loadConfig();
		}

		return this.settings;
	}

	public async saveSettings(settings: z.infer<typeof ConfigSpec>): Promise<void> {
		try {
			await ConfigSpec.parseAsync(settings);

			const old = this.settings;

			this.settings = settings;

			this.bus.emit('config:save', old, settings);

			await fs.promises.writeFile(path.join(ASTRAY_FOLDER, 'config.json'), JSON.stringify(settings, null, 2));
		} catch (e) {
			console.error(e);
		}
	}
}
