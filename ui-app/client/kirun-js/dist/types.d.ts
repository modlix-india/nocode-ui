export class Namespaces {
    static readonly SYSTEM: string;
    static readonly SYSTEM_CTX: string;
    static readonly SYSTEM_LOOP: string;
    static readonly SYSTEM_ARRAY: string;
    static readonly SYSTEM_OBJECT: string;
    static readonly SYSTEM_JSON: string;
    static readonly MATH: string;
    static readonly STRING: string;
    static readonly DATE: string;
    private constructor();
}
export function isNullValue(v: any): boolean;
export class ArraySchemaType {
    constructor(ast?: ArraySchemaType);
    setSingleSchema(schema: Schema): ArraySchemaType;
    setTupleSchema(schemas: Schema[]): ArraySchemaType;
    getSingleSchema(): Schema | undefined;
    getTupleSchema(): Schema[] | undefined;
    isSingleType(): boolean;
    static of(...schemas: Schema[]): ArraySchemaType;
    static from(obj: any): ArraySchemaType | undefined;
}
export enum StringFormat {
    DATETIME = "DATETIME",
    TIME = "TIME",
    DATE = "DATE",
    EMAIL = "EMAIL",
    REGEX = "REGEX"
}
export enum SchemaType {
    INTEGER = "Integer",
    LONG = "Long",
    FLOAT = "Float",
    DOUBLE = "Double",
    STRING = "String",
    OBJECT = "Object",
    ARRAY = "Array",
    BOOLEAN = "Boolean",
    NULL = "Null"
}
export abstract class Type {
    abstract getAllowedSchemaTypes(): Set<SchemaType>;
    abstract contains(type: SchemaType): boolean;
}
export class MultipleType extends Type {
    constructor(type: Set<SchemaType> | MultipleType);
    getType(): Set<SchemaType>;
    setType(type: Set<SchemaType>): MultipleType;
    getAllowedSchemaTypes(): Set<SchemaType>;
    contains(type: SchemaType): boolean;
}
export class SingleType extends Type {
    constructor(type: SchemaType | SingleType);
    getType(): SchemaType;
    getAllowedSchemaTypes(): Set<SchemaType>;
    contains(type: SchemaType): boolean;
}
export class TypeUtil {
    static of(...types: SchemaType[]): Type;
    static from(types: any): Type | undefined;
}
export class AdditionalType {
    constructor(apt?: AdditionalType | undefined);
    getBooleanValue(): boolean | undefined;
    getSchemaValue(): Schema | undefined;
    setBooleanValue(booleanValue: boolean): AdditionalType;
    setSchemaValue(schemaValue: Schema): AdditionalType;
    static from(obj: any): AdditionalType | undefined;
}
export class SchemaDetails {
    constructor(sd?: SchemaDetails | undefined);
    getPreferredComponent(): string | undefined;
    setPreferredComponent(comp: string | undefined): SchemaDetails;
    getValidationMessages(): Map<string, string> | undefined;
    setValidationMessages(messages: Map<string, string> | undefined): SchemaDetails;
    getValidationMessage(key: string): string | undefined;
    setProperties(properties: Map<String, any> | undefined): SchemaDetails;
    getProperties(): Map<String, any> | undefined;
    setStyleProperties(styleProperties: Map<String, any> | undefined): SchemaDetails;
    getStyleProperties(): Map<String, any> | undefined;
    getOrder(): number | undefined;
    setOrder(order: number | undefined): SchemaDetails;
    getLabel(): string | undefined;
    setLabel(label: string | undefined): SchemaDetails;
    static from(detail: {
        preferredComponent: string | undefined;
        validationMessages: {
            [key: string]: string;
        } | undefined;
        properties: {
            [key: string]: any;
        } | undefined;
        styleProperties: {
            [key: string]: any;
        } | undefined;
        order: number | undefined;
        label: string | undefined;
    }): SchemaDetails | undefined;
}
export class Schema {
    static readonly NULL: Schema;
    static readonly SCHEMA: Schema;
    static ofString(id: string): Schema;
    static ofInteger(id: string): Schema;
    static ofFloat(id: string): Schema;
    static ofLong(id: string): Schema;
    static ofDouble(id: string): Schema;
    static ofAny(id: string): Schema;
    static ofAnyNotNull(id: string): Schema;
    static ofNumber(id: string): Schema;
    static ofBoolean(id: string): Schema;
    static of(id: string, ...types: SchemaType[]): Schema;
    static ofObject(id: string): Schema;
    static ofRef(ref: string): Schema;
    static ofArray(id: string, ...itemSchemas: Schema[]): Schema;
    static fromListOfSchemas(list: any): Schema[] | undefined;
    static fromMapOfSchemas(map: any): Map<string, Schema> | undefined;
    static from(obj: any, isStringSchema?: boolean): Schema | undefined;
    constructor(schema?: Schema);
    getTitle(): string | undefined;
    getFullName(): string;
    get$defs(): Map<string, Schema> | undefined;
    set$defs($defs: Map<string, Schema>): Schema;
    getNamespace(): string;
    setNamespace(namespace: string): Schema;
    getName(): string | undefined;
    setName(name: string): Schema;
    getVersion(): number;
    setVersion(version: number): Schema;
    getRef(): string | undefined;
    setRef(ref: string): Schema;
    getType(): Type | undefined;
    setType(type: Type): Schema;
    getAnyOf(): Schema[] | undefined;
    setAnyOf(anyOf: Schema[]): Schema;
    getAllOf(): Schema[] | undefined;
    setAllOf(allOf: Schema[]): Schema;
    getOneOf(): Schema[] | undefined;
    setOneOf(oneOf: Schema[]): Schema;
    getNot(): Schema | undefined;
    setNot(not: Schema): Schema;
    getDescription(): string | undefined;
    setDescription(description: string): Schema;
    getExamples(): any[] | undefined;
    setExamples(examples: any[]): Schema;
    getDefaultValue(): any;
    setDefaultValue(defaultValue: any): Schema;
    getComment(): string | undefined;
    setComment(comment: string): Schema;
    getEnums(): any[] | undefined;
    setEnums(enums: any[]): Schema;
    getConstant(): any;
    setConstant(constant: any): Schema;
    getPattern(): string | undefined;
    setPattern(pattern: string): Schema;
    getFormat(): StringFormat | undefined;
    setFormat(format: StringFormat): Schema;
    getMinLength(): number | undefined;
    setMinLength(minLength: number): Schema;
    getMaxLength(): number | undefined;
    setMaxLength(maxLength: number): Schema;
    getMultipleOf(): number | undefined;
    setMultipleOf(multipleOf: number): Schema;
    getMinimum(): number | undefined;
    setMinimum(minimum: number): Schema;
    getMaximum(): number | undefined;
    setMaximum(maximum: number): Schema;
    getExclusiveMinimum(): number | undefined;
    setExclusiveMinimum(exclusiveMinimum: number): Schema;
    getExclusiveMaximum(): number | undefined;
    setExclusiveMaximum(exclusiveMaximum: number): Schema;
    getProperties(): Map<string, Schema> | undefined;
    setProperties(properties: Map<string, Schema>): Schema;
    getAdditionalProperties(): AdditionalType | undefined;
    setAdditionalProperties(additionalProperties: AdditionalType): Schema;
    getAdditionalItems(): AdditionalType | undefined;
    setAdditionalItems(additionalItems: AdditionalType): Schema;
    getRequired(): string[] | undefined;
    setRequired(required: string[]): Schema;
    getPropertyNames(): Schema | undefined;
    setPropertyNames(propertyNames: Schema): Schema;
    getMinProperties(): number | undefined;
    setMinProperties(minProperties: number): Schema;
    getMaxProperties(): number | undefined;
    setMaxProperties(maxProperties: number): Schema;
    getPatternProperties(): Map<string, Schema> | undefined;
    setPatternProperties(patternProperties: Map<string, Schema>): Schema;
    getItems(): ArraySchemaType | undefined;
    setItems(items: ArraySchemaType): Schema;
    getContains(): Schema | undefined;
    setContains(contains: Schema): Schema;
    getMinContains(): number | undefined;
    setMinContains(minContains: number): Schema;
    getMaxContains(): number | undefined;
    setMaxContains(maxContains: number): Schema;
    getMinItems(): number | undefined;
    setMinItems(minItems: number): Schema;
    getMaxItems(): number | undefined;
    setMaxItems(maxItems: number): Schema;
    getUniqueItems(): boolean | undefined;
    setUniqueItems(uniqueItems: boolean): Schema;
    getPermission(): string | undefined;
    setPermission(permission: string): Schema;
    getDetails(): SchemaDetails | undefined;
    setDetails(details: SchemaDetails): Schema;
    getViewDetails(): SchemaDetails | undefined;
    setViewDetails(viewDetails: SchemaDetails): Schema;
}
export class SchemaReferenceException extends Error {
    cause?: Error;
    constructor(schemaPath: string, message: string, err?: Error);
    getSchemaPath(): string;
    getCause(): Error | undefined;
}
export enum ParameterType {
    CONSTANT = "CONSTANT",
    EXPRESSION = "EXPRESSION"
}
export class Parameter {
    static readonly SCHEMA: Schema;
    static readonly EXPRESSION: Schema;
    constructor(pn: string | Parameter, schema?: Schema);
    getSchema(): Schema;
    setSchema(schema: Schema): Parameter;
    getParameterName(): string;
    setParameterName(parameterName: string): Parameter;
    isVariableArgument(): boolean;
    setVariableArgument(variableArgument: boolean): Parameter;
    getType(): ParameterType;
    setType(type: ParameterType): Parameter;
    static ofEntry(name: string, schema: Schema, variableArgument?: boolean, type?: ParameterType): [string, Parameter];
    static of(name: string, schema: Schema, variableArgument?: boolean, type?: ParameterType): Parameter;
    static from(json: any): Parameter;
}
export interface Repository<T> {
    find(namespace: string, name: string): Promise<T | undefined>;
    filter(name: string): Promise<string[]>;
}
export class MapUtil {
    static of<K, V>(k1?: K, v1?: V, k2?: K, v2?: V, k3?: K, v3?: V, k4?: K, v4?: V, k5?: K, v5?: V, k6?: K, v6?: V, k7?: K, v7?: V, k8?: K, v8?: V, k9?: K, v9?: V, k10?: K, v10?: V): Map<K, V>;
    static ofArrayEntries<K, V>(...entry: [K, V][]): Map<K, V>;
    static entry<K, V>(k: K, v: V): MapEntry<K, V>;
    static ofEntries<K, V>(...entry: MapEntry<K, V>[]): Map<K, V>;
    static ofEntriesArray<K, V>(...entry: [K, V][]): Map<K, V>;
    private constructor();
}
export class MapEntry<K, V> {
    k: K;
    v: V;
    constructor(k: K, v: V);
}
export class KIRunSchemaRepository implements Repository<Schema> {
    constructor();
    find(namespace: string, name: string): Promise<Schema | undefined>;
    filter(name: string): Promise<string[]>;
}
export class Event {
    static readonly OUTPUT: string;
    static readonly ERROR: string;
    static readonly ITERATION: string;
    static readonly TRUE: string;
    static readonly FALSE: string;
    static readonly SCHEMA_NAME: string;
    static readonly SCHEMA: Schema;
    constructor(evn: string | Event, parameters?: Map<string, Schema>);
    getName(): string;
    setName(name: string): Event;
    getParameters(): Map<string, Schema>;
    setParameters(parameters: Map<string, Schema>): Event;
    static outputEventMapEntry(parameters: Map<string, Schema>): [string, Event];
    static eventMapEntry(eventName: string, parameters: Map<string, Schema>): [string, Event];
    static from(json: any): Event;
}
export class KIRuntimeException extends Error {
    cause?: Error;
    constructor(message: string, err?: Error);
    getCause(): Error | undefined;
}
export class EventResult {
    constructor(name: string, result: Map<string, any>);
    getName(): string;
    setName(name: string): EventResult;
    getResult(): Map<string, any>;
    setResult(result: Map<string, any>): EventResult;
    static outputOf(result: Map<string, any>): EventResult;
    static of(eventName: string, result: Map<string, any>): EventResult;
}
export interface FunctionOutputGenerator {
    next(): EventResult | undefined;
}
export class FunctionOutput {
    constructor(arg: EventResult[] | FunctionOutputGenerator);
    next(): EventResult | undefined;
    allResults(): EventResult[];
}
export class FunctionSignature {
    static readonly SCHEMA: Schema;
    constructor(value: string | FunctionSignature);
    getNamespace(): string;
    setNamespace(namespace: string): FunctionSignature;
    getName(): string;
    setName(name: string): FunctionSignature;
    getParameters(): Map<string, Parameter>;
    setParameters(parameters: Map<string, Parameter>): FunctionSignature;
    getEvents(): Map<string, Event>;
    setEvents(events: Map<string, Event>): FunctionSignature;
    getFullName(): string;
}
export class ContextElement {
    static readonly NULL: ContextElement;
    constructor(schema?: Schema, element?: any);
    getSchema(): Schema | undefined;
    setSchema(schema: Schema): ContextElement;
    getElement(): any;
    setElement(element: any): ContextElement;
}
export class StringFormatter {
    static format(formatString: string, ...params: any[]): string;
    private constructor();
}
export class StringUtil {
    private constructor();
    static nthIndex(str: string, c: string, from: number | undefined, occurance: number): number;
    static splitAtFirstOccurance(str: string, c: string): [string | undefined, string | undefined];
    static splitAtLastOccurance(str: string, c: string): [string | undefined, string | undefined];
    static isNullOrBlank(str: string | undefined): boolean;
}
export class ExpressionEvaluationException extends Error {
    cause?: Error;
    constructor(expression: string, message: string, err?: Error);
    getCause(): Error | undefined;
}
export abstract class TokenValueExtractor {
    static readonly REGEX_SQUARE_BRACKETS: RegExp;
    static readonly REGEX_DOT: RegExp;
    protected static splitPath(token: string): string[];
    getValue(token: string): any;
    protected retrieveElementFrom(token: string, parts: string[], startPart: number, jsonElement: any): any;
    protected resolveForEachPartOfTokenWithBrackets(token: string, parts: string[], partNumber: number, cPart: string, cElement: any): any;
    protected checkIfObject(token: string, parts: string[], partNumber: number, jsonElement: any): void;
    protected abstract getValueInternal(token: string): any;
    abstract getPrefix(): string;
    abstract getStore(): any;
}
export class Position {
    static readonly SCHEMA_NAME: string;
    static readonly SCHEMA: Schema;
    constructor(left: number, top: number);
    getLeft(): number;
    setLeft(left: number): Position;
    getTop(): number;
    setTop(top: number): Position;
    static from(json: any): Position | undefined;
}
export class AbstractStatement {
    constructor(ast?: AbstractStatement);
    getComment(): string | undefined;
    setComment(comment: string): AbstractStatement;
    isOverride(): boolean;
    setOverride(override: boolean): AbstractStatement;
    getDescription(): string | undefined;
    setDescription(description: string): AbstractStatement;
    getPosition(): Position | undefined;
    setPosition(position: Position | undefined): AbstractStatement;
}
export enum ParameterReferenceType {
    VALUE = "VALUE",
    EXPRESSION = "EXPRESSION"
}
export class ParameterReference {
    static readonly SCHEMA: Schema;
    constructor(type: ParameterReferenceType | ParameterReference);
    getType(): ParameterReferenceType;
    setType(type: ParameterReferenceType): ParameterReference;
    getKey(): string;
    setKey(key: string): ParameterReference;
    getValue(): any;
    setValue(value: any): ParameterReference;
    getExpression(): string | undefined;
    setExpression(expression: string): ParameterReference;
    setOrder(order: number): ParameterReference;
    getOrder(): number | undefined;
    static ofExpression(value: any): [string, ParameterReference];
    static ofValue(value: any): [string, ParameterReference];
    static from(e: any): ParameterReference;
}
export class Statement extends AbstractStatement {
    static readonly SCHEMA_NAME: string;
    static readonly SCHEMA: Schema;
    constructor(sn: string | Statement, namespace?: string, name?: string);
    getStatementName(): string;
    setStatementName(statementName: string): Statement;
    getNamespace(): string;
    setNamespace(namespace: string): Statement;
    getName(): string;
    setName(name: string): Statement;
    getParameterMap(): Map<string, Map<string, ParameterReference>>;
    setParameterMap(parameterMap: Map<string, Map<string, ParameterReference>>): Statement;
    getDependentStatements(): Map<string, boolean>;
    setDependentStatements(dependentStatements: Map<string, boolean>): Statement;
    getExecuteIftrue(): Map<string, boolean>;
    setExecuteIftrue(executeIftrue: Map<string, boolean>): Statement;
    equals(obj: any): boolean;
    static ofEntry(statement: Statement): [string, Statement];
    static from(json: any): Statement;
}
export interface GraphVertexType<K> {
    getUniqueKey(): K;
    getDepenedencies(): Set<string>;
}
export enum StatementMessageType {
    ERROR = "ERROR",
    WARNING = "WARNING",
    MESSAGE = "MESSAGE"
}
export class StatementMessage {
    constructor(messageType?: StatementMessageType, message?: string);
    getMessageType(): StatementMessageType | undefined;
    setMessageType(messageType: StatementMessageType): StatementMessage;
    getMessage(): string | undefined;
    setMessage(message: string): StatementMessage;
    toString(): string;
}
export class StatementExecution implements GraphVertexType<String> {
    constructor(statement: Statement);
    getStatement(): Statement;
    setStatement(statement: Statement): StatementExecution;
    getMessages(): StatementMessage[];
    setMessages(messages: StatementMessage[]): StatementExecution;
    getDependencies(): Set<string>;
    setDependencies(dependencies: Set<string>): StatementExecution;
    getUniqueKey(): string;
    addMessage(type: StatementMessageType, message: string): void;
    addDependency(dependency: string): void;
    getDepenedencies(): Set<string>;
    equals(obj: Object): boolean;
}
export class ContextTokenValueExtractor extends TokenValueExtractor {
    static readonly PREFIX: string;
    constructor(context: Map<string, ContextElement>);
    protected getValueInternal(token: string): any;
    getPrefix(): string;
    getStore(): any;
}
export class OutputMapTokenValueExtractor extends TokenValueExtractor {
    static readonly PREFIX: string;
    constructor(output: Map<string, Map<string, Map<string, any>>>);
    protected getValueInternal(token: string): any;
    getPrefix(): string;
    getStore(): any;
}
export class FunctionExecutionParameters {
    constructor(functionRepository: Repository<Function>, schemaRepository: Repository<Schema>, executionId?: string);
    getExecutionId(): string;
    getContext(): Map<string, ContextElement> | undefined;
    setContext(context: Map<string, ContextElement>): FunctionExecutionParameters;
    getArguments(): Map<string, any> | undefined;
    setArguments(args: Map<string, any>): FunctionExecutionParameters;
    getEvents(): Map<string, Map<string, any>[]> | undefined;
    setEvents(events: Map<string, Map<string, any>[]>): FunctionExecutionParameters;
    getStatementExecution(): StatementExecution | undefined;
    setStatementExecution(statementExecution: StatementExecution): FunctionExecutionParameters;
    getSteps(): Map<string, Map<string, Map<string, any>>> | undefined;
    setSteps(steps: Map<string, Map<string, Map<string, any>>>): FunctionExecutionParameters;
    getCount(): number;
    setCount(count: number): FunctionExecutionParameters;
    getValuesMap(): Map<string, TokenValueExtractor>;
    getFunctionRepository(): Repository<Function>;
    setFunctionRepository(functionRepository: Repository<Function>): FunctionExecutionParameters;
    getSchemaRepository(): Repository<Schema>;
    setSchemaRepository(schemaRepository: Repository<Schema>): FunctionExecutionParameters;
    addTokenValueExtractor(...extractors: TokenValueExtractor[]): FunctionExecutionParameters;
    setValuesMap(valuesMap: Map<string, TokenValueExtractor>): FunctionExecutionParameters;
    setExecutionContext(executionContext: Map<string, any>): FunctionExecutionParameters;
    getExecutionContext(): Map<string, any>;
}
export interface Function {
    getSignature(): FunctionSignature;
    getProbableEventSignature(probableParameters: Map<string, Schema[]>): Map<string, Event>;
    execute(context: FunctionExecutionParameters): Promise<FunctionOutput>;
}
export class LinkedList<T> {
    length: number;
    constructor(list?: T[]);
    push(value: T): void;
    pop(): T;
    isEmpty(): boolean;
    size(): number;
    get(index: number): T;
    set(index: number, value: T): LinkedList<T>;
    toString(): string;
    toArray(): T[];
    peek(): T;
    peekLast(): T;
    getFirst(): T;
    removeFirst(): T;
    removeLast(): T;
    addAll(list: T[]): LinkedList<T>;
    add(t: T): LinkedList<T>;
    map<U>(callbackfn: (value: T, index: number) => U, thisArg?: any): LinkedList<U>;
    indexOf(value: T): number;
    forEach(callbackfn: (value: T, index: number) => void, thisArg?: any): void;
}
export function deepEqual(x: any, y: any): boolean;
export class Tuple2<F, S> {
    protected f: F;
    protected s: S;
    constructor(f: F, s: S);
    getT1(): F;
    getT2(): S;
    setT1(f: F): Tuple2<F, S>;
    setT2(s: S): Tuple2<F, S>;
}
export class Tuple3<F, S, T> extends Tuple2<F, S> {
    protected t: T;
    constructor(f: F, s: S, t: T);
    getT3(): T;
    setT1(f: F): Tuple3<F, S, T>;
    setT2(s: S): Tuple3<F, S, T>;
    setT3(t: T): Tuple3<F, S, T>;
}
export class Tuple4<F, S, T, FR> extends Tuple3<F, S, T> {
    protected fr: FR;
    constructor(f: F, s: S, t: T, fr: FR);
    getT4(): FR;
    setT1(f: F): Tuple4<F, S, T, FR>;
    setT2(s: S): Tuple4<F, S, T, FR>;
    setT3(t: T): Tuple4<F, S, T, FR>;
    setT4(fr: FR): Tuple4<F, S, T, FR>;
}
export class SchemaValidationException extends Error {
    cause?: Error;
    constructor(schemaPath: string, message: string, sve?: SchemaValidationException[], err?: Error);
    getSchemaPath(): string;
    getCause(): Error | undefined;
}
export class SchemaUtil {
    static getDefaultValue(s: Schema | undefined, sRepository: Repository<Schema> | undefined): Promise<any>;
    static hasDefaultValueOrNullSchemaType(s: Schema | undefined, sRepository: Repository<Schema> | undefined): Promise<boolean>;
    static getSchemaFromRef(schema: Schema, sRepository: Repository<Schema> | undefined, ref: string | undefined, iteration?: number): Promise<Schema | undefined>;
    private constructor();
}
enum ConversionMode {
    STRICT = "STRICT",
    LENIENT = "LENIENT",
    USE_DEFAULT = "USE_DEFAULT",
    SKIP = "SKIP"
}
export class AnyOfAllOfOneOfValidator {
    static validate(parents: Schema[], schema: Schema, repository: Repository<Schema> | undefined, element: any, convert?: boolean, mode?: ConversionMode): Promise<any>;
    private constructor();
}
export class ArrayValidator {
    static validate(parents: Schema[], schema: Schema, repository: Repository<Schema> | undefined, element: any, convert?: boolean, mode?: ConversionMode): Promise<any>;
    static countContains(parents: Schema[], schema: Schema, repository: Repository<Schema> | undefined, array: any[], stopOnFirst?: boolean): Promise<number>;
    static checkUniqueItems(parents: Schema[], schema: Schema, array: any[]): void;
    static checkMinMaxItems(parents: Schema[], schema: Schema, array: any[]): void;
    static checkItems(parents: Schema[], schema: Schema, repository: Repository<Schema> | undefined, array: any[], convert?: boolean, mode?: ConversionMode): Promise<void>;
    private constructor();
}
export class BooleanValidator {
    static validate(parents: Schema[], schema: Schema, element: any): any;
    private constructor();
}
export class NullValidator {
    static validate(parents: Schema[], schema: Schema, element: any): any;
    private constructor();
}
export class NumberValidator {
    static validate(type: SchemaType, parents: Schema[], schema: Schema, element: any): any;
    private constructor();
}
export class ObjectValidator {
    static validate(parents: Schema[], schema: Schema, repository: Repository<Schema> | undefined, element: any, convert?: boolean, mode?: ConversionMode): Promise<any>;
}
export class StringValidator {
    static validate(parents: Schema[], schema: Schema, element: any): any;
    private constructor();
}
export class TypeValidator {
    static validate(parents: Schema[], type: SchemaType, schema: Schema, repository: Repository<Schema> | undefined, element: any, convert?: boolean, mode?: ConversionMode): Promise<any>;
    private constructor();
}
export class SchemaValidator {
    static path(parents: Schema[] | undefined): string;
    static validate(parents: Schema[] | undefined, schema: Schema | undefined, repository: Repository<Schema> | undefined, element: any, convert?: boolean, mode?: ConversionMode): Promise<any>;
    static constantValidation(parents: Schema[], schema: Schema, element: any): any;
    static enumCheck(parents: Schema[], schema: Schema, element: any): any;
    static typeValidation(parents: Schema[], schema: Schema, repository: Repository<Schema> | undefined, element: any, convert?: boolean, mode?: ConversionMode): Promise<any>;
}
export abstract class AbstractFunction implements Function {
    protected validateArguments(args: Map<string, any>, schemaRepository: Repository<Schema>, statementExecution: StatementExecution | undefined): Promise<Map<string, any>>;
    execute(context: FunctionExecutionParameters): Promise<FunctionOutput>;
    getProbableEventSignature(probableParameters: Map<string, Schema[]>): Map<string, Event>;
    protected abstract internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput>;
    abstract getSignature(): FunctionSignature;
}
export class ExecutionException extends Error {
    cause?: Error;
    constructor(message: string, err?: Error);
    getCause(): Error | undefined;
}
export class JsonExpression {
    constructor(expression: string);
    getExpression(): string;
}
export class PrimitiveUtil {
    static findPrimitiveNullAsBoolean(element: any): Tuple2<SchemaType, any>;
    static findPrimitive(element: any): Tuple2<SchemaType, any>;
    static findPrimitiveNumberType(element: any): Tuple2<SchemaType, any>;
    static compare(a: any, b: any): number;
    static comparePrimitive(oa: any, ob: any): number;
    static toPrimitiveType(e: any): number;
    private constructor();
}
export class ArrayUtil {
    static removeAListFrom(source: any[], removeList: any[]): void;
    static of<K>(...k: K[]): K[];
    private constructor();
}
export function duplicate(obj: any): any;
export class KIRunConstants {
    static readonly NAMESPACE: String;
    static readonly NAME: String;
    static readonly ID: String;
    private constructor();
}
export class StringBuilder {
    constructor(str?: string);
    append(x: any): StringBuilder;
    toString(): string;
    trim(): StringBuilder;
    setLength(num: number): StringBuilder;
    length(): number;
    charAt(index: number): string;
    deleteCharAt(index: number): StringBuilder;
    insert(index: number, str: string): StringBuilder;
    substring(start: number, end: number): string;
}
export class ExpressionToken {
    expression: string;
    constructor(expression: string);
    getExpression(): string;
    toString(): string;
}
export class ExpressionTokenValue extends ExpressionToken {
    constructor(expression: string, element: any);
    getTokenValue(): any;
    getElement(): any;
    toString(): string;
}
export class Operation {
    static readonly MULTIPLICATION: Operation;
    static readonly DIVISION: Operation;
    static readonly INTEGER_DIVISION: Operation;
    static readonly MOD: Operation;
    static readonly ADDITION: Operation;
    static readonly SUBTRACTION: Operation;
    static readonly NOT: Operation;
    static readonly AND: Operation;
    static readonly OR: Operation;
    static readonly LESS_THAN: Operation;
    static readonly LESS_THAN_EQUAL: Operation;
    static readonly GREATER_THAN: Operation;
    static readonly GREATER_THAN_EQUAL: Operation;
    static readonly EQUAL: Operation;
    static readonly NOT_EQUAL: Operation;
    static readonly BITWISE_AND: Operation;
    static readonly BITWISE_OR: Operation;
    static readonly BITWISE_XOR: Operation;
    static readonly BITWISE_COMPLEMENT: Operation;
    static readonly BITWISE_LEFT_SHIFT: Operation;
    static readonly BITWISE_RIGHT_SHIFT: Operation;
    static readonly BITWISE_UNSIGNED_RIGHT_SHIFT: Operation;
    static readonly UNARY_PLUS: Operation;
    static readonly UNARY_MINUS: Operation;
    static readonly UNARY_LOGICAL_NOT: Operation;
    static readonly UNARY_BITWISE_COMPLEMENT: Operation;
    static readonly ARRAY_OPERATOR: Operation;
    static readonly ARRAY_RANGE_INDEX_OPERATOR: Operation;
    static readonly OBJECT_OPERATOR: Operation;
    static readonly NULLISH_COALESCING_OPERATOR: Operation;
    static readonly CONDITIONAL_TERNARY_OPERATOR: Operation;
    static readonly UNARY_OPERATORS: Set<Operation>;
    static readonly ARITHMETIC_OPERATORS: Set<Operation>;
    static readonly LOGICAL_OPERATORS: Set<Operation>;
    static readonly BITWISE_OPERATORS: Set<Operation>;
    static readonly CONDITIONAL_OPERATORS: Set<Operation>;
    static readonly OPERATOR_PRIORITY: Map<Operation, number>;
    static readonly OPERATORS: Set<string>;
    static readonly OPERATORS_WITHOUT_SPACE_WRAP: Set<string>;
    static readonly OPERATION_VALUE_OF: Map<string, Operation>;
    static readonly UNARY_MAP: Map<Operation, Operation>;
    static readonly BIGGEST_OPERATOR_SIZE: number;
    constructor(operator: string, operatorName?: string, shouldBeWrappedInSpace?: boolean);
    getOperator(): string;
    getOperatorName(): string;
    shouldBeWrappedInSpace(): boolean;
    valueOf(str: string): Operation | undefined;
    toString(): string;
}
export class Expression extends ExpressionToken {
    constructor(expression?: string, l?: ExpressionToken, r?: ExpressionToken, op?: Operation);
    getTokens(): LinkedList<ExpressionToken>;
    getOperations(): LinkedList<Operation>;
    getTokensArray(): ExpressionToken[];
    getOperationsArray(): Operation[];
    toString(): string;
    equals(o: Expression): boolean;
}
export class ObjectValueSetterExtractor extends TokenValueExtractor {
    constructor(store: any, prefix: string);
    protected getValueInternal(token: string): any;
    getStore(): any;
    setStore(store: any): ObjectValueSetterExtractor;
    setValue(token: string, value: any, overwrite?: boolean, deleteOnNull?: boolean): void;
    getPrefix(): string;
}
export abstract class BinaryOperator {
    abstract apply(t: any, u: any): any;
    nullCheck(e1: any, e2: any, op: Operation): void;
}
export class ArithmeticAdditionOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class ArithmeticDivisionOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class ArithmeticIntegerDivisionOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class ArithmeticModulusOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class ArithmeticMultiplicationOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class ArithmeticSubtractionOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class ArrayOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class BitwiseAndOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class BitwiseLeftShiftOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class BitwiseOrOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class BitwiseRightShiftOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class BitwiseUnsignedRightShiftOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class BitwiseXorOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class LogicalAndOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class LogicalEqualOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class LogicalGreaterThanEqualOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class LogicalGreaterThanOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class LogicalLessThanEqualOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class LogicalNotEqualOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class LogicalLessThanOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class LogicalOrOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class ObjectOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class LogicalNullishCoalescingOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export class ArrayRangeOperator extends BinaryOperator {
    apply(t: any, u: any): any;
}
export abstract class UnaryOperator {
    abstract apply(t: any): any;
    nullCheck(e1: any, op: Operation): void;
}
export class ArithmeticUnaryMinusOperator extends UnaryOperator {
    apply(t: any): any;
}
export class ArithmeticUnaryPlusOperator extends UnaryOperator {
    apply(t: any): any;
}
export class BitwiseComplementOperator extends UnaryOperator {
    apply(t: any): any;
}
export class LogicalNotOperator extends UnaryOperator {
    apply(t: any): any;
}
export class LiteralTokenValueExtractor extends TokenValueExtractor {
    static readonly INSTANCE: LiteralTokenValueExtractor;
    protected getValueInternal(token: string): any;
    getPrefix(): string;
    getStore(): any;
    getValueFromExtractors(token: string, maps: Map<string, TokenValueExtractor>): any;
}
declare abstract class TernaryOperator {
    abstract apply(t: any, u: any, v: any): any;
    nullCheck(e1: any, e2: any, e3: any, op: Operation): void;
}
export class ConditionalTernaryOperator extends TernaryOperator {
    apply(t: any, u: any, v: any): any;
}
export class ExpressionEvaluator {
    constructor(exp: Expression | string);
    evaluate(valuesMap: Map<string, TokenValueExtractor>): any;
    getExpression(): Expression;
    getExpressionString(): string;
}
export class StatementGroup extends AbstractStatement {
    static readonly SCHEMA: Schema;
    constructor(statementGroupName: string, statements?: Map<string, boolean>);
    getStatementGroupName(): string;
    setStatementGroupName(statementGroupName: string): StatementGroup;
    getStatements(): Map<string, boolean>;
    setStatements(statements: Map<string, boolean>): StatementGroup;
    static from(json: any): StatementGroup;
}
export class FunctionDefinition extends FunctionSignature {
    static readonly SCHEMA: Schema;
    constructor(name: string);
    getVersion(): number;
    setVersion(version: number): FunctionDefinition;
    getSteps(): Map<string, Statement>;
    setSteps(steps: Map<string, Statement>): FunctionDefinition;
    getStepGroups(): Map<string, StatementGroup> | undefined;
    setStepGroups(stepGroups: Map<string, StatementGroup>): FunctionDefinition;
    getParts(): FunctionDefinition[] | undefined;
    setParts(parts: FunctionDefinition[]): FunctionDefinition;
    static from(json: any): FunctionDefinition;
}
export class GraphVertex<K, T extends GraphVertexType<K>> {
    constructor(graph: ExecutionGraph<K, T>, data: T);
    getData(): T;
    setData(data: T): GraphVertex<K, T>;
    getOutVertices(): Map<string, Set<GraphVertex<K, T>>>;
    setOutVertices(outVertices: Map<string, Set<GraphVertex<K, T>>>): GraphVertex<K, T>;
    getInVertices(): Set<Tuple2<GraphVertex<K, T>, string>>;
    setInVertices(inVertices: Set<Tuple2<GraphVertex<K, T>, string>>): GraphVertex<K, T>;
    getGraph(): ExecutionGraph<K, T>;
    setGraph(graph: ExecutionGraph<K, T>): GraphVertex<K, T>;
    getKey(): K;
    addOutEdgeTo(type: string, vertex: GraphVertex<K, T>): GraphVertex<K, T>;
    addInEdgeTo(vertex: GraphVertex<K, T>, type: string): GraphVertex<K, T>;
    hasIncomingEdges(): boolean;
    hasOutgoingEdges(): boolean;
    getSubGraphOfType(type: string): ExecutionGraph<K, T>;
    toString(): string;
}
export class ExecutionGraph<K, T extends GraphVertexType<K>> {
    constructor(isSubGrph?: boolean);
    areEdgesBuilt(): boolean;
    setEdgesBuilt(built: boolean): void;
    getVerticesData(): T[];
    addVertex(data: T): GraphVertex<K, T>;
    getVertex(key: K): GraphVertex<K, T> | undefined;
    getVertexData(key: K): T | undefined;
    getVerticesWithNoIncomingEdges(): GraphVertex<K, T>[];
    isCyclic(): boolean;
    addVertices(values: T[]): void;
    getNodeMap(): Map<K, GraphVertex<K, T>>;
    isSubGraph(): boolean;
    toString(): string;
}
export class ArgumentsTokenValueExtractor extends TokenValueExtractor {
    static readonly PREFIX: string;
    constructor(args: Map<string, any>);
    protected getValueInternal(token: string): any;
    getPrefix(): string;
    getStore(): any;
}
export class KIRuntime extends AbstractFunction {
    constructor(fd: FunctionDefinition, debugMode?: boolean);
    getSignature(): FunctionSignature;
    getExecutionPlan(fRepo: Repository<Function>, sRepo: Repository<Schema>): Promise<ExecutionGraph<string, StatementExecution>>;
    protected internalExecute(inContext: FunctionExecutionParameters): Promise<FunctionOutput>;
    makeEdges(graph: ExecutionGraph<string, StatementExecution>): Tuple2<Tuple2<string, string>[], Map<string, string>>;
}
export class HybridRepository<T> implements Repository<T> {
    repos: Repository<T>[];
    constructor(...repos: Repository<T>[]);
    find(namespace: string, name: string): Promise<T | undefined>;
    filter(name: string): Promise<string[]>;
}
export class KIRunFunctionRepository extends HybridRepository<Function> {
    constructor();
}
export class Argument {
    constructor(argumentIndex: number, name: string, value?: any);
    getArgumentIndex(): number;
    setArgumentIndex(argumentIndex: number): Argument;
    getName(): string;
    setName(name: string): Argument;
    getValue(): any;
    setValue(value: any): Argument;
    static of(name: string, value: any): Argument;
}

//# sourceMappingURL=types.d.ts.map
