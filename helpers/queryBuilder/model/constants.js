const ERROR_MSG_BAD_SEQUANCE = 'not correct sequence in join syntax';
const ERROR_MSG_JOIN_SAME_TABLE = 'join the same table';
const ERROR_MSG_BAD_ON_SYNTAX = 'not correct usage of "on" statement';
const ERROR_MSG_NOT_A_TABLE = 'argument is not a table';

const TABLE_ALIAS = 'table_alias';
const TABLE_FIELD = 'table field';
const STAR_FIELD = 'star field';

const KEYWORD = 'keyword';
const FIELDS_SELECT = 'fields select';

const JOIN = 'join';

const TABLE = 'table';
const LEFT_JOIN = 'left join';
const ON = 'on';
const AND = 'and';
const SELECT = 'select';
const INSERT_INTO = 'insert into';
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

class TableProto {}
class FieldProto {}
class JoinProto {}
class WhereProto {}

module.exports = {
  TableProto,
  FieldProto,
  JoinProto,
  WhereProto,
  KEYWORD,
  FIELDS_SELECT,
  TABLE,
  LEFT_JOIN,
  JOIN,
  ON,
  AND,
  ERROR_MSG_BAD_SEQUANCE,
  ERROR_MSG_JOIN_SAME_TABLE,
  ERROR_MSG_BAD_ON_SYNTAX,
  ERROR_MSG_NOT_A_TABLE,
  TABLE_ALIAS,
  SELECT,
  INSERT_INTO,
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
};
