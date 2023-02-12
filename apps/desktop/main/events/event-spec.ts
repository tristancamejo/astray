import { Song } from '@astray/swrapper';
import { ConfigSpec } from '../config/_spec';
import { RadioState } from '../radio/Radio';

export type EventSpec = {
	start: [];
	'radio:play': [Song];
	'radio:tick': [RadioState];
	'radio:stop': [];
	'library:update': [Song[]];
	'config:save': [ConfigSpec, ConfigSpec];
	'config:sources:add': [string];
	'config:sources:remove': [string];
};
