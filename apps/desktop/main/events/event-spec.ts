import { ConfigSpec } from '../config/_spec';
import { RadioState } from '../radio/Radio';
import { Song } from '../radio/Song';

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
