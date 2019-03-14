## Тестовое задание. Тестовое задание для Node.js.

**Содержание:**

1. Постановка задачи
2. Поя1снение решения
3. Установка
4. Запуск
5. История _code review_
   1. _Code review №1_
   2. Примечения по исправлению ошибок
6. TODO

#### 1. Постановка задачи.

Реализовать http-server на базе фреймворка Koa2, соответствующий следующим требованиям:

1. Работает с базой данных mysql. В субд есть таблица books(1e5 записей, заполнить случайными данными). У каждой книги должны быть поля _title, date, author, description, image_. Реализация смежных таблиц на усмотрение кандидата, архитектурные решения оцениваются.​ **Работает на "чистом" SQL**
2. Присутствуют три контроллера:

   1. Добавляет записи в субд
   2. Отдает. Сделать возможность сортировки|группировки по всем возможным полям, возможность порционного получения с
      оффсетом **\***
   3. Изменяет

**\*** - приветствуются варианты кэширования

### 2. Пояснение решения.

**Данные.**

Автор может написать несколько книг, книга может иметь несколько авторов. C точки зрения реляционных БД это соотношение "многие ко многим".

**Структура БД.**

```
table: authors
    id     <---------┐  primary key
    name             |
                     |
table: book_authors  |
    author_id  ------┘  compound primary key (author_id, book_id)
    book_id    ------┐
                     |
table: books         |
    id       <-------┘  primary key
    title
    date
    description
    image               path_to_file
```

Для предотвращения возможных дубликатов связки автор-книга используем _compound primary key_.

**Взаимодействие с данными.**

Так как на уровне постановки задания сециально поставлено условие работы с "чистым" SQL, то

1. Создан QueryBuilder.
2. Построена на основе него абстракция для работы с данными.

**Обложка книги.**

Поле image хранит путь к файлу.

**Кэширование.**

Стратегия кэширования основана на поиске сделанного ранее SQL запроса. Время жизни кэша определяется в переменной окружения, default: 1 час. Любая операция мутации данных сбрасывает кэш.

**Тестирование.**

### 3. Установка.

```
npm install
```

требуется бд mysql и пользователь с правами на [create, drop, insert, update, select, delete] table;
передача параметров реализована через переменные окружения

### 4. Запуск.

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

### 5. История _code review_.

#### 5.1. _Code review №1_.

Пояснение:
Версия [репзитория](https://github.com/SmolnikovAM/test-task-kvdr-spb/tree/4e0558ceacb99450ad162198ee32884d5cf67820), на основе которого проходитло **code review**
каждое замечание имеет степень критичности по трехбальной шкале.

1. "Авторы и книги" - это классический вопрос собеседований. Тут зависимость "много ко многим". **3/3**
2. Полезно проверять опечатки. **0.5/3**
3. Не давать пользователем на create/drop **1/3**
4. В модуле rc есть возможность создавать специальные файлы для загрузки начальных параметров. Пользователю будет их проще поправить в файле. **0.5/3**
5. Рекомендация придерживаться классической структуры запуска тестов npm test. **0.5/3**
6. Боевую лучше используя написать NODE_ENV = "production". **1/3**
7. Ненужные параметры окружения env = "SEED"
8. Вместо runInBand можно было бы сделать запуск нескольких сущностей jest с несколькими БД
9. Не используемая зависимость **1/3**
10. Есть роут, который нежен только для теста. По хорошему у приложения не должно быть не нужных роутов. Можно было бы это обойти роутом helthcheck, который может быть использован kubernates **1/3**
11. У supertest есть fluent syntax, благодаря которому можно через chain делать expect. И Нужно было бы возвразать promise с результатами выполнения теста **1/3**
12. Тест с добавлением в таблицу авторов является хрупким, потому что проверка завязана на id. При распределенных серверах (один пишет только четные номера, а второй только нечетные) могут тесты проваливаться. Пожтому некорректно проверять id, потому что зависит от конкретной кофигурации sql-сервера **1/3**
13. Тест с insert author не достаточно проверяет поведение и мы не проверили, что сущность не добавилась в БД. Нужно было бы сделать еще один запрос на проверку списка и чтобы убедится, что эта сущность добавилась в БД. **3/3**
14. e2e тесты должны тестировать системы по принципу черного ящика. Поэтому проверять систему нужно только ее же внешними запросами, то есть не используя внутренние инструменты. **3/3**
15. не установлены pre commit hook для eslint
16. В синтаксисе mysql таблицы используются в кавычках **3/3**
17. Вместо send лучше назвать execute **1/3**
18. Присутствует закомментированный код. **1/3**
19. Куча файлов index.js. Это затрудняет навигацию. **0.5/3**
20. Нет обобщенного класса для работы с сущностями репозитория. **3/3**
21. Константы табличек лучше импортить снаружи, к примеру, из репозитория **0/3**
22. Лучше на каждый роут сделать отдельный файл и с ним схема так как они логически связаны. **3/3**
23. Ошибка при реализации кеша. То есть он должен только кешировать запрос, а согласно реализации он дополнительно делает запрос. **3/3**
24. _put_ вместо _patch_. **3/3**
25. Параметр большой картинки должен быть настраиваемым. **3/3**
26. У нормальных людей картинки грузятся через форму. Нужно отправлять форм-data **3/3**
27. middleware по cache должна быть экспортирована из cache service **3/3**
28. Запуск приложения привязан к переменным окружения. if(!module.parent) **2/3**

#### 5.2. Примечения по исправлению ошибок.

### 6. TODO

1. Тесты на cache - функциональность.
2. Полное покрытие тестами QueryBuilder
3. Полная проверка входяшийх параметров через ajv
