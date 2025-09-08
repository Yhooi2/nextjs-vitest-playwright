// import cleanupTestDatabase from '@/utils/__tests__/utils/cleanup-test-database';

// Выполняется один раз до (setup) и после (tearDown) всего
// набора тестов

export async function setup() {
  // Запускается перед всеми тестами
  // Это немного избыточно, но иногда тест выполняется не полностью
  // и оставляет мусор, как старые базы данных или данные в таблице
  //   await cleanupTestDatabase();
}

export async function teardown() {
  // Запускается после всех тестов
  //   await cleanupTestDatabase();
}
