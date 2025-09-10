const envConfigs = {
  development: {
    databaseFile: 'dev.db.sqlite3',
    currentEnv: 'development',
  },
  production: {
    databaseFile: 'prod.db.sqlite3',
    currentEnv: 'production',
  },
  test: {
    databaseFile: '.int.test.db.sqlite3',
    currentEnv: 'test',
  },
  e2e: {
    databaseFile: 'e2e.test.db.sqlite3',
    currentEnv: 'e2e',
  },
} as const;


type EnvConfigs = typeof envConfigs;
type EnvConfigsKeys = keyof EnvConfigs;

type EnvConfig = EnvConfigs[EnvConfigsKeys]

function isValidEnv(env: string): env is EnvConfigsKeys {
  return Object.keys(envConfigs).includes(env);
}

function checkEnv(): EnvConfigsKeys {
  const currentEnv = process.env.CURRENT_ENV;
  if (!currentEnv) {
    throw new Error('CURRENT_ENV is not set. Please check your .env* files and src/env/configs.ts');
  }
  if (!isValidEnv(currentEnv)) {
    throw new Error(
      `Invalid CURRENT_ENV value: '${currentEnv}'. Must be one of: ${Object.keys(envConfigs).join(', ')}`
    );
  }
  return currentEnv;
}

export function getFullEnv(): EnvConfig {
    const currentEnv = checkEnv();
    return envConfigs[currentEnv];
}

export function getEnv<T extends keyof EnvConfig>(key: T): EnvConfig[T] {
    const currentEnv = checkEnv();
    return envConfigs[currentEnv][key];
}
