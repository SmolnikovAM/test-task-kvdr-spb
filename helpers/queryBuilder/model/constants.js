const ERROR_MSG_BAD_SEQUANCE = 'not correct sequence in join syntax';
const ERROR_MSG_JOIN_SAME_TABLE = 'join the same table';
const ERROR_MSG_BAD_ON_SYNTAX = 'not correct usage of "on" statement';
const ERROR_MSG_NOT_A_TABLE = 'argument is not a table';

const TABLE_ALIAS = 'table_alias';
const TABLE_FIELD = 'table field';
const STAR_FIELD = 'star field';
const TABLE_QUERY = 'table query';
const QUERY = 'query';

const KEYWORD = 'keyword';
const FIELDS_SELECT = 'fields select';

const JOIN = 'join';
const TABLE = 'table';
const LEFT_JOIN = 'left join';
const ON = 'on';
const AND = 'and';
const SELECT = 'select';
const INSERT_INTO = 'insert into';
const INSERT = 'insert';
const INTO = 'into';
const UPDATE = 'update';
const DELETE = 'delete';
const FROM = 'from';
const VALUES = 'values';
const SET = 'set';
const WHERE = 'where';
const GROUP_BY = 'group by';
const ORDER_BY = 'order by';
const LIMIT = 'limit';
const OFFSET = 'offset';
const STAR = '*';
const ASC = 'asc';
const DESC = 'desc';

const DATE_DATA_TYPE = 'date type';
const DEFAULT_DATE_FORMAT = '%Y-%m-%d';

const GREATER_THAN = '>';
const LESS_THAN = '<';
const EQUAL = '=';
const LIKE = 'like';

class TableProto {}
class FieldProto {}
class JoinProto {}
class WhereProto {}
class QueryBuilderProto {}

const OPERATORS_PATTERN = `^(\\${EQUAL}|${LIKE}|\\${GREATER_THAN}|\\${LESS_THAN})$`;

const SQLCONST = {
  TABLE_QUERY,
  OPERATORS_PATTERN,
  GREATER_THAN,
  LESS_THAN,
  LIKE,
  EQUAL,
  TableProto,
  FieldProto,
  JoinProto,
  WhereProto,
  QueryBuilderProto,
  KEYWORD,
  FIELDS_SELECT,
  TABLE,
  LEFT_JOIN,
  JOIN,
  ON,
  AND,
  DATE_DATA_TYPE,
  DEFAULT_DATE_FORMAT,
  ERROR_MSG_BAD_SEQUANCE,
  ERROR_MSG_JOIN_SAME_TABLE,
  ERROR_MSG_BAD_ON_SYNTAX,
  ERROR_MSG_NOT_A_TABLE,
  TABLE_ALIAS,
  SELECT,
  INSERT_INTO,
  INSERT,
  INTO,
  UPDATE,
  DELETE,
  FROM,
  VALUES,
  SET,
  WHERE,
  GROUP_BY,
  ORDER_BY,
  LIMIT,
  OFFSET,
  TABLE_FIELD,
  STAR_FIELD,
  STAR,
  ASC,
  DESC,
  QUERY,
};

SQLCONST.SQLCONST = SQLCONST;

module.exports = SQLCONST;
