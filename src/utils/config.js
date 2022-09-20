export const Environment = {
	DEV: 'development',
	PRODUCTION: 'production',
};

const getEnv = (source, name) => {
	const value = source[name];
	if (typeof value === 'undefined') throw new Error(`Property ${name} is missing from source.`);
	return value;
};

const intoArray = (value) => {
	const list = JSON.parse(value);
    if (!Array.isArray(list)) throw new Error(`Value '${value}' is not a parsable array.`);
	return list;
}

const load = (source = process.env) => {
	const env = getEnv(source, 'NODE_ENV');
	if (![Environment.DEV, Environment.PRODUCTION].includes(env)) {
		throw new Error('Invalid NODE_ENV variable, must be \'development\' or \'production\'');
	}

	return {
		db: {
			table: getEnv(source, 'DT_TABLE'),
		},
		websites: intoArray(getEnv(source, 'WEBSITES')),
		env,
	};
};

let globalConfig;

export const getConfig = (source, refresh = false) => {
	if (globalConfig && refresh) {
		globalConfig = Object.assign(globalConfig, load(source));
	}
	else if (!globalConfig) {
		globalConfig = load(source);
	}
	return globalConfig;
};