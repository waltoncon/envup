{
  function quote(str) {
    return JSON.stringify(str);
  }

  function pairToJSON(key, value) {
    return quote(key) + ":" + value;
  }

  function objectToJSON(pairs) {
    return "{" + pairs.join(",") + "}";
  }

  function arrayToJSON(items) {
    return "[" + items.join(",") + "]";
  }
}

TfVars
  = _ pairs:Pair* _ {
      return objectToJSON(pairs);
    }

Pair
  = key:Identifier _ "=" _ value:Value _ {
      return pairToJSON(key, value);
    }

Value
  = String
  / Boolean
  / Number
  / Array
  / Object

String
  = '"' chars:DoubleQuotedChar* '"' { return quote(chars.join('')); }
  / "'" chars:SingleQuotedChar* "'" { return quote(chars.join('')); }

DoubleQuotedChar
  = !'"' . { return text(); }

SingleQuotedChar
  = !"'" . { return text(); }

Boolean
  = "true"  { return "true"; }
  / "false" { return "false"; }

Number
  = value:('-'? [0-9]+ ('.' [0-9]+)?) { return value.flat().join(''); }

Array
  = "[" _ items:ValueList? _ "]" { return arrayToJSON(items !== null ? items : []); }

ValueList
  = head:Value tail:(_ "," _ Value)* _ ","? {
      return [head].concat(tail.map(t => t[3]));
    }

Object
  = "{" _ pairs:ObjectPairs? _ "}" { 
      return objectToJSON(pairs !== null ? pairs : []);
    }

ObjectPairs
  = head:Pair tail:(_ Pair)* {
      return [head].concat(tail.map(t => t[1]));
    }

Identifier
  = [a-zA-Z_][a-zA-Z0-9_-]* { return text(); }

_ "whitespace"
  = [ \t\n\r]*
