## Тестовое задание

## Постановка задачи

## Тестовое задание для Node.js:

Реализовать http-server на базе фреймворка Koa2,
соответствующий следующим требованиям:

1. Работает с базой данных mysql. В субд есть табличка books(1e5 записей, забить самостоятельно случайно, у каждой книги должны быть поля title, date, autor, description, image). Реализация смежных табличек на усмотрение кандидата, архитектурные решения оцениваются.​ **Работает на чистом SQL**
2. Присутствуют три контроллера:
   2.1. Добавляет записи в субд
   2.2. Отдает. Сделать возможность сортировки|группировки по
   всем возможным полям, возможность порционного получения с
   оффсетом
   2.3. Изменяет

**замечание к 2.2** - приветствуются варианты кэширования

## Пояснение решения

Данные:

```
table: authors
    id     <------|
    name          |
                  |
table: books      |
    id            |
    title         |
    date          |
    author_id ----|
    description
    image // path_to_file
```

Картинки загружаются отдельно.

Стартегия кэширования основана на поиске сделанного ранее SQL запроса.
Время жизни кэша определяется в переменной окружения, default: 1 час.
Любая операция мутации сбрасывает кэш.

## Установка

```
npm install
```

требуется бд mysql и пользователь с правами на [create, drop, insert, update, select] table;
передача параметров реализована через переменные окружения

## Запуск

Пример запуска e2e - тестирования.

```
export KVDRTEST_db__host=localhost &&
export KVDRTEST_db__database=kvadrotest &&
export KVDRTEST_db__user=testuser &&
export KVDRTEST_db__password=password &&
export KVDRTEST_staticFolder="./staticTest" &&
npm run test:e2e
```

Для "рабочей" базы необходим другой путь

```
KVDRTEST_db__host=localhost &&
KVDRTEST_db__database=kvadro &&
KVDRTEST_db__user=testuser &&
KVDRTEST_db__password=password &&
npm start
```

Загрузка фикстур

```
KVDRTEST_db__host=localhost &&
KVDRTEST_db__database=kvadro &&
KVDRTEST_db__user=testuser &&
KVDRTEST_db__password=password &&
npm run seed
```

Для unit-тестов база не требуется

```
npm run test:unit
```

## TODO

1. Тесты на cache - функциональность.
2. Полное покрытие тестами QueryBuilder
3. Полная проверка входяшийх параметров через ajv
