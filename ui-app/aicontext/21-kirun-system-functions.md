# KIRun System Functions Reference

## Overview

KIRun System functions are built-in functions available in all KIRun function definitions and event functions. They provide core logic operations like conditionals, loops, array/string manipulation, math, date handling, and more.

## Namespaces

| Namespace | Description |
|-----------|-------------|
| `System` | Core functions (If, GenerateEvent, Print, Wait) |
| `System.Loop` | Loop functions (RangeLoop, ForEachLoop, CountLoop, Break) |
| `System.Context` | Context/variable management (Create, Get, Set) |
| `System.Array` | Array manipulation functions |
| `System.String` | String manipulation functions |
| `System.Math` | Mathematical functions |
| `System.Date` | Date and time functions |
| `System.Object` | Object manipulation functions |
| `System.JSON` | JSON parsing/stringifying |

---

## System Namespace

### If

Conditional branching based on a condition.

**Namespace**: `System`  
**Name**: `If`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `condition` | any | Yes | Value to evaluate as boolean |

**Events**:
- `true`: Triggered when condition is truthy
- `false`: Triggered when condition is falsy
- `output`: Always triggered after true/false

**Example**:

```json
{
  "statementName": "checkAge",
  "name": "If",
  "namespace": "System",
  "parameterMap": {
    "condition": {
      "p1": { "type": "EXPRESSION", "expression": "Arguments.age >= 18", "order": 1 }
    }
  }
}
```

**Connecting to If events**:

```json
{
  "adultAction": {
    "name": "SetStore",
    "namespace": "UIEngine",
    "dependentStatements": { "Steps.checkAge.true": true }
  },
  "minorAction": {
    "name": "SetStore",
    "namespace": "UIEngine",
    "dependentStatements": { "Steps.checkAge.false": true }
  }
}
```

---

### GenerateEvent

Emit an event with results (used to return values from functions).

**Namespace**: `System`  
**Name**: `GenerateEvent`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `eventName` | string | No | `"output"` | Name of event to emit |
| `results` | array | No | `[]` | Array of {name, value} pairs |

**Events**: `output`

**Example**:

```json
{
  "statementName": "returnResult",
  "name": "GenerateEvent",
  "namespace": "System",
  "parameterMap": {
    "eventName": {
      "p1": { "type": "VALUE", "value": "output" }
    },
    "results": {
      "p2": {
        "type": "VALUE",
        "order": 1,
        "value": {
          "name": "result",
          "value": { "isExpression": true, "value": "Context.total" }
        }
      }
    }
  }
}
```

---

### Print

Debug print to console.

**Namespace**: `System`  
**Name**: `Print`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `values` | array | No | Values to print (variadic) |

**Events**: `output`

---

### Wait

Delay execution for specified time.

**Namespace**: `System`  
**Name**: `Wait`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `millis` | integer | No | `0` | Milliseconds to wait |

**Events**: `output`

---

### ValidateSchema

Validate data against a schema.

**Namespace**: `System`  
**Name**: `ValidateSchema`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | any | Yes | Data to validate |
| `schema` | object | Yes | Schema definition |

**Events**:
- `output` with `result` (validated data)
- `error` with `errorMessage`

---

## System.Loop Namespace

### RangeLoop

Loop from a start value to end value.

**Namespace**: `System.Loop`  
**Name**: `RangeLoop`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `from` | number | No | `0` | Start value |
| `to` | number | No | `1` | End value (exclusive) |
| `step` | number | No | `1` | Increment value |

**Events**:
- `iteration`: Each iteration with `index`
- `output`: After loop completes with final `value`

**Example**:

```json
{
  "statementName": "loop",
  "name": "RangeLoop",
  "namespace": "System.Loop",
  "parameterMap": {
    "from": { "p1": { "type": "VALUE", "value": 0 } },
    "to": { "p2": { "type": "EXPRESSION", "expression": "Arguments.count" } },
    "step": { "p3": { "type": "VALUE", "value": 1 } }
  }
}
```

**Accessing loop index**:

```json
{
  "processItem": {
    "parameterMap": {
      "index": {
        "p1": { "type": "EXPRESSION", "expression": "Steps.loop.iteration.index" }
      }
    },
    "dependentStatements": { "Steps.loop.iteration": true }
  }
}
```

---

### ForEachLoop

Iterate over an array.

**Namespace**: `System.Loop`  
**Name**: `ForEachLoop`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | array | Yes | Array to iterate |

**Events**:
- `iteration`: Each iteration with `index` and `each` (current element)
- `output`: After loop completes with final count

**Example**:

```json
{
  "statementName": "forEach",
  "name": "ForEachLoop",
  "namespace": "System.Loop",
  "parameterMap": {
    "source": {
      "p1": { "type": "EXPRESSION", "expression": "Arguments.items" }
    }
  }
}
```

**Accessing current element**:

```json
{
  "processItem": {
    "parameterMap": {
      "item": { "p1": { "type": "EXPRESSION", "expression": "Steps.forEach.iteration.each" } },
      "idx": { "p2": { "type": "EXPRESSION", "expression": "Steps.forEach.iteration.index" } }
    },
    "dependentStatements": { "Steps.forEach.iteration": true }
  }
}
```

---

### CountLoop

Loop a specific number of times.

**Namespace**: `System.Loop`  
**Name**: `CountLoop`

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `count` | integer | No | `1` | Number of iterations |

**Events**:
- `iteration`: Each iteration with `index`
- `output`: After loop completes

---

### Break

Exit from a loop early.

**Namespace**: `System.Loop`  
**Name**: `Break`

**Parameters**: None

**Events**: `output`

---

## System.Context Namespace

### Create

Create a context variable.

**Namespace**: `System.Context`  
**Name**: `Create`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Variable name (alphanumeric, starts with letter) |
| `schema` | object | Yes | Schema definition for the variable |

**Events**: `output`

**Example**:

```json
{
  "statementName": "createTotal",
  "name": "Create",
  "namespace": "System.Context",
  "parameterMap": {
    "name": { "p1": { "type": "VALUE", "value": "total" } },
    "schema": { 
      "p2": { 
        "type": "VALUE", 
        "value": { "type": "INTEGER", "defaultValue": 0 } 
      }
    }
  }
}
```

---

### Set

Set a context variable value.

**Namespace**: `System.Context`  
**Name**: `Set`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Context path (e.g., `Context.total`, `Context.arr[0]`) |
| `value` | any | Yes | Value to set |

**Events**: `output`

**Example**:

```json
{
  "statementName": "incrementTotal",
  "name": "Set",
  "namespace": "System.Context",
  "parameterMap": {
    "name": { "p1": { "type": "VALUE", "value": "Context.total" } },
    "value": { "p2": { "type": "EXPRESSION", "expression": "Context.total + 1" } }
  }
}
```

---

### Get

Get a context variable value.

**Namespace**: `System.Context`  
**Name**: `Get`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Context path |

**Events**: `output` with `value`

---

## System.Array Namespace

### Common Array Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `AddFirst` | Prepend element | `source`, `element` → `result` |
| `InsertLast` | Append element | `source`, `element` → `result` |
| `Insert` | Insert at index | `source`, `element`, `index` → `result` |
| `Delete` | Delete at index | `source`, `index` → `result` |
| `DeleteFirst` | Delete first element | `source` → `result` |
| `DeleteLast` | Delete last element | `source` → `result` |
| `DeleteFrom` | Delete range | `source`, `from`, `length` → `result` |
| `Concatenate` | Join arrays | `source1`, `source2` → `result` |
| `SubArray` | Get sub-array | `source`, `from`, `length` → `result` |
| `Reverse` | Reverse array | `source` → `result` |
| `Sort` | Sort array | `source`, `ascending` → `result` |
| `Shuffle` | Randomize order | `source` → `result` |
| `RemoveDuplicates` | Remove duplicates | `source` → `result` |
| `IndexOf` | Find element | `source`, `element` → `index` |
| `LastIndexOf` | Find last occurrence | `source`, `element` → `index` |
| `IndexOfArray` | Find sub-array | `source`, `search` → `index` |
| `Min` | Get minimum | `source` → `result` |
| `Max` | Get maximum | `source` → `result` |
| `Frequency` | Count occurrences | `source`, `element` → `count` |
| `Copy` | Deep copy array | `source` → `result` |
| `Fill` | Fill with value | `source`, `value`, `from`, `length` → `result` |
| `Rotate` | Rotate elements | `source`, `distance` → `result` |
| `Equals` | Compare arrays | `source1`, `source2` → `result` |
| `Disjoint` | Check no common elements | `source1`, `source2` → `result` |
| `MisMatch` | Find first difference | `source1`, `source2` → `index` |
| `BinarySearch` | Binary search | `source`, `element` → `index` |
| `Compare` | Compare arrays | `source1`, `source2` → `result` |
| `Join` | Join to string | `source`, `delimiter` → `result` |
| `ArrayToObject` | Convert to object | `source` → `result` |
| `ArrayToArrayOfObjects` | Pairs to objects | `source` → `result` |

**Example - InsertLast**:

```json
{
  "statementName": "addItem",
  "name": "InsertLast",
  "namespace": "System.Array",
  "parameterMap": {
    "source": { "p1": { "type": "EXPRESSION", "expression": "Context.items" } },
    "element": { "p2": { "type": "VALUE", "value": "new item" } }
  }
}
```

---

## System.String Namespace

### String Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `Trim` | Remove whitespace | `source` → `result` |
| `TrimStart` | Trim start | `source` → `result` |
| `TrimEnd` | Trim end | `source` → `result` |
| `Length` | Get length | `source` → `result` (integer) |
| `LowerCase` | To lowercase | `source` → `result` |
| `UpperCase` | To uppercase | `source` → `result` |
| `IsBlank` | Check if blank | `source` → `result` (boolean) |
| `IsEmpty` | Check if empty | `source` → `result` (boolean) |
| `Contains` | Check contains | `source`, `search` → `result` (boolean) |
| `StartsWith` | Check prefix | `source`, `search` → `result` (boolean) |
| `EndsWith` | Check suffix | `source`, `search` → `result` (boolean) |
| `EqualsIgnoreCase` | Compare ignoring case | `source`, `second` → `result` (boolean) |
| `Matches` | Regex match | `source`, `regex` → `result` (boolean) |
| `IndexOf` | Find substring | `source`, `search` → `result` (integer) |
| `LastIndexOf` | Find last occurrence | `source`, `search` → `result` (integer) |
| `IndexOfWithStartPoint` | Find from index | `source`, `search`, `from` → `result` |
| `LastIndexOfWithStartPoint` | Find last from index | `source`, `search`, `from` → `result` |
| `Frequency` | Count occurrences | `source`, `search` → `result` (integer) |
| `Repeat` | Repeat string | `source`, `count` → `result` |
| `Replace` | Replace all | `source`, `search`, `replace` → `result` |
| `ReplaceFirst` | Replace first | `source`, `search`, `replace` → `result` |
| `SubString` | Get substring | `source`, `from`, `to` → `result` |
| `Concatenate` | Join strings | `values` (variadic) → `result` |
| `Split` | Split string | `source`, `delimiter` → `result` (array) |
| `Reverse` | Reverse string | `source` → `result` |
| `ToString` | Convert to string | `source` → `result` |
| `DeleteForGivenLength` | Delete chars | `source`, `at`, `length` → `result` |
| `InsertAtGivenPosition` | Insert string | `source`, `at`, `insert` → `result` |
| `ReplaceAtGivenPosition` | Replace at position | `source`, `at`, `length`, `replace` → `result` |
| `PrePad` | Pad start | `source`, `length`, `char` → `result` |
| `PostPad` | Pad end | `source`, `length`, `char` → `result` |
| `TrimTo` | Trim to length | `source`, `length` → `result` |

**Example - Concatenate**:

```json
{
  "statementName": "buildMessage",
  "name": "Concatenate",
  "namespace": "System.String",
  "parameterMap": {
    "values": {
      "p1": { "type": "VALUE", "value": "Hello, ", "order": 1 },
      "p2": { "type": "EXPRESSION", "expression": "Arguments.name", "order": 2 },
      "p3": { "type": "VALUE", "value": "!", "order": 3 }
    }
  }
}
```

---

## System.Math Namespace

### Math Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `Add` | Sum numbers | `values` (variadic) → `result` |
| `Absolute` | Absolute value | `value` → `result` |
| `Ceiling` | Round up | `value` → `result` |
| `Floor` | Round down | `value` → `result` |
| `Round` | Round to nearest | `value` → `result` |
| `SquareRoot` | Square root | `value` → `result` |
| `CubeRoot` | Cube root | `value` → `result` |
| `Power` | Power | `value`, `power` → `result` |
| `Maximum` | Max of numbers | `values` (variadic) → `result` |
| `Minimum` | Min of numbers | `values` (variadic) → `result` |
| `Random` | Random 0-1 | → `result` |
| `RandomInt` | Random integer | `minValue`, `maxValue` → `value` |
| `RandomFloat` | Random float | `minValue`, `maxValue` → `value` |
| `RandomLong` | Random long | `minValue`, `maxValue` → `value` |
| `RandomDouble` | Random double | `minValue`, `maxValue` → `value` |
| `Sine` | Sine | `value` → `result` |
| `Cosine` | Cosine | `value` → `result` |
| `Tangent` | Tangent | `value` → `result` |
| `ArcSine` | Arc sine | `value` → `result` |
| `ArcCosine` | Arc cosine | `value` → `result` |
| `ArcTangent` | Arc tangent | `value` → `result` |
| `ArcTangent2` | Arc tangent 2 | `y`, `x` → `result` |
| `HyperbolicSine` | Hyperbolic sine | `value` → `result` |
| `HyperbolicCosine` | Hyperbolic cosine | `value` → `result` |
| `HyperbolicTangent` | Hyperbolic tangent | `value` → `result` |
| `Hypotenuse` | Hypotenuse | `a`, `b` → `result` |
| `Exponential` | e^x | `value` → `result` |
| `ExponentialMinus1` | e^x - 1 | `value` → `result` |
| `LogNatural` | Natural log | `value` → `result` |
| `Log10` | Log base 10 | `value` → `result` |
| `ToDegrees` | Radians to degrees | `value` → `result` |
| `ToRadians` | Degrees to radians | `value` → `result` |

---

## System.Date Namespace

### Date Functions

| Function | Description |
|----------|-------------|
| `GetCurrentTimestamp` | Get current ISO timestamp |
| `EpochSecondsToTimestamp` | Convert epoch seconds to ISO |
| `EpochMillisecondsToTimestamp` | Convert epoch ms to ISO |
| `TimestampToEpochSeconds` | Convert ISO to epoch seconds |
| `TimestampToEpochMilliseconds` | Convert ISO to epoch ms |
| `GetDay` | Get day of month |
| `GetMonth` | Get month (1-12) |
| `GetYear` | Get year |
| `GetDayOfWeek` | Get weekday (1-7) |
| `GetHours` | Get hours (0-23) |
| `GetMinutes` | Get minutes (0-59) |
| `GetSeconds` | Get seconds (0-59) |
| `GetMilliseconds` | Get milliseconds |
| `GetDaysInMonth` | Days in month |
| `GetDaysInYear` | Days in year |
| `SetDay` | Set day of month |
| `SetMonth` | Set month |
| `SetYear` | Set year |
| `SetHours` | Set hours |
| `SetMinutes` | Set minutes |
| `SetSeconds` | Set seconds |
| `SetMilliseconds` | Set milliseconds |
| `SetTimeZone` | Set timezone |
| `GetTimeZoneName` | Get timezone name |
| `GetTimeZoneOffset` | Get timezone offset |
| `AddTime` | Add duration to timestamp |
| `SubtractTime` | Subtract duration |
| `Difference` | Difference between timestamps |
| `IsBefore` | Check if before |
| `IsAfter` | Check if after |
| `IsSame` | Check if same |
| `IsSameOrBefore` | Check if same or before |
| `IsSameOrAfter` | Check if same or after |
| `IsBetween` | Check if between two dates |
| `IsInLeapYear` | Check if leap year |
| `IsInDST` | Check if daylight saving |
| `StartOf` | Start of period (day, month, year) |
| `EndOf` | End of period |
| `FirstOf` | First of period |
| `LastOf` | Last of period |
| `ToDateString` | Format timestamp |
| `FromDateString` | Parse date string |
| `FromNow` | Relative time from now |
| `IsValidISODate` | Validate ISO date string |

---

## System.Object Namespace

### Object Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `ObjectKeys` | Get object keys | `source` → `result` (array) |
| `ObjectValues` | Get object values | `source` → `result` (array) |
| `ObjectEntries` | Get key-value pairs | `source` → `result` (array of [key, value]) |
| `ObjectDeleteKey` | Delete a key | `source`, `key` → `result` |
| `ObjectPutValue` | Set a value | `source`, `key`, `value` → `result` |
| `ObjectConvert` | Convert object | `source`, `schema` → `result` |

---

## System.JSON Namespace

### JSONParse

Parse JSON string to object.

**Namespace**: `System.JSON`  
**Name**: `JSONParse`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | string | Yes | JSON string to parse |

**Events**:
- `output` with `value` (parsed object)
- `error` with `errorMessage`

**Example**:

```json
{
  "statementName": "parseJSON",
  "name": "JSONParse",
  "namespace": "System.JSON",
  "parameterMap": {
    "source": { "p1": { "type": "EXPRESSION", "expression": "Arguments.jsonString" } }
  }
}
```

---

### JSONStringify

Convert object to JSON string.

**Namespace**: `System.JSON`  
**Name**: `JSONStringify`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | any | Yes | Object to stringify |

**Events**: `output` with `value` (JSON string)

---

## Common Patterns

### Conditional Logic

```json
{
  "if": {
    "name": "If",
    "namespace": "System",
    "parameterMap": {
      "condition": { "p1": { "type": "EXPRESSION", "expression": "Arguments.value > 0" } }
    }
  },
  "positive": {
    "name": "GenerateEvent",
    "namespace": "System",
    "parameterMap": {
      "results": {
        "p1": { "type": "VALUE", "value": { "name": "result", "value": { "isExpression": true, "value": "'positive'" } } }
      }
    },
    "dependentStatements": { "Steps.if.true": true }
  }
}
```

### Loop with Accumulator

```json
{
  "create": {
    "name": "Create",
    "namespace": "System.Context",
    "parameterMap": {
      "name": { "p1": { "type": "VALUE", "value": "sum" } },
      "schema": { "p2": { "type": "VALUE", "value": { "type": "INTEGER", "defaultValue": 0 } } }
    }
  },
  "loop": {
    "name": "ForEachLoop",
    "namespace": "System.Loop",
    "parameterMap": {
      "source": { "p1": { "type": "EXPRESSION", "expression": "Arguments.numbers" } }
    },
    "dependentStatements": { "Steps.create.output": true }
  },
  "add": {
    "name": "Set",
    "namespace": "System.Context",
    "parameterMap": {
      "name": { "p1": { "type": "VALUE", "value": "Context.sum" } },
      "value": { "p2": { "type": "EXPRESSION", "expression": "Context.sum + Steps.loop.iteration.each" } }
    },
    "dependentStatements": { "Steps.loop.iteration": true }
  }
}
```

## Related Documents

- [08-functions-and-actions.md](08-functions-and-actions.md) - UIEngine functions
- [19-function-definitions.md](19-function-definitions.md) - Function definitions
- [07-event-system.md](07-event-system.md) - Event system

