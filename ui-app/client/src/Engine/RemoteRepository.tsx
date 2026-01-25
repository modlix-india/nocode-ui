import {
	AbstractFunction,
	EventResult,
	Function,
	FunctionDefinition,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	KIRuntime,
	Repository,
	Schema,
	Tuple2,
	isNullValue,
} from '@fincity/kirun-js';
import axios from 'axios';
import { LOCAL_STORE_PREFIX, STORE_PREFIX } from '../constants';
import { getDataFromPath } from '../context/StoreContext';
import { shortUUID } from '../util/shortUUID';

export enum REPO_TYPE {
	FUNCTION = 'functions',
	SCHEMA = 'schemas',
}

export enum REPO_SERVER {
	UI = 'ui',
	CORE = 'core',
}

const functionRepoCache = new Map<string, RemoteRepository<Function>>();
const schemaRepoCache = new Map<string, RemoteRepository<Schema>>();

const HALF_A_MINUTE = 60 * 1000;

let URL_PREFIX: string | undefined = undefined;

function getUrlPrefix(): string {
	// Only use cached value if it's not empty
	if (URL_PREFIX !== undefined && URL_PREFIX !== '') return URL_PREFIX;

	const url = getDataFromPath(`${STORE_PREFIX}.url`, []);

	if (globalThis.isDebugMode) {
		console.log('[RemoteRepository] getUrlPrefix - url from store:', url);
	}

	const prefix = url?.appCode && url?.clientCode ? `/${url.appCode}/${url.clientCode}/page/repos/` : '';

	// Only cache if we have a valid (non-empty) prefix
	if (prefix !== '') {
		URL_PREFIX = prefix;
		if (globalThis.isDebugMode) {
			console.log('[RemoteRepository] Cached URL prefix:', URL_PREFIX);
		}
	}

	return prefix;
}

export class RemoteRepository<T> implements Repository<T> {
	private readonly repoType: REPO_TYPE;
	private readonly repoServer: REPO_SERVER;

	private readonly internalCache: Map<string, Tuple2<number, T>> = new Map();
	private internalFilterCache: Array<string> | undefined = undefined;
	private readonly promiseCache: Map<string, Promise<T | undefined>> = new Map();
	private filterCachedAt: number = 0;

	private readonly jsonConversion: (json: any) => T | undefined;
	private readonly appCode: string | undefined;
	private readonly clientCode: string | undefined;
	private readonly includeKIRunRepos: boolean;

	constructor(
		appCode: string | undefined,
		clientCode: string | undefined,
		jsonConversion: (json: any) => T | undefined,
		includeKIRunRepos = false,
		repoType = REPO_TYPE.FUNCTION,
		repoServer = REPO_SERVER.CORE,
	) {
		this.repoType = repoType;
		this.repoServer = repoServer;
		this.jsonConversion = jsonConversion;
		this.appCode = appCode;
		this.clientCode = clientCode;
		this.includeKIRunRepos = includeKIRunRepos;
	}

	private get url(): string {
		return `${getUrlPrefix()}api/${this.repoServer.toLowerCase()}/${this.repoType}/`;
	}

	public emptyCache() {
		this.internalCache.clear();
		this.internalFilterCache = undefined;
		this.filterCachedAt = 0;
	}

	private makeFindCall(namespace: string, name: string): Promise<T | undefined> {
		const key = `${namespace}.${name}`;
		if (this.promiseCache.has(key)) return this.promiseCache.get(key)!;
		const promise = new Promise<T | undefined>((resolve, reject) => {
			const headers: any = {};
			const authToken = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);
			if (authToken) headers.Authorization = authToken;
			if (globalThis.isDebugMode)
				headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();
			axios
				.get(`${this.url}repositoryFind`, {
					params: {
						appCode: this.appCode,
						clientCode: this.clientCode,
						includeKIRunRepos: this.includeKIRunRepos,
						namespace,
						name,
					},
					headers,
				})
				.then(response => {
					const convObj = this.jsonConversion(response.data);
					this.internalCache.set(key, new Tuple2<number, any>(Date.now(), convObj));
					resolve(convObj);
				})
				.catch(error => {
					reject(error);
				})
				.finally(() => this.promiseCache.delete(key));
		});

		this.promiseCache.set(key, promise);
		return promise;
	}

	public async find(namespace: string, name: string): Promise<T | undefined> {
		const key = `${namespace}.${name}`;

		if (Date.now() - (this.internalCache.get(key)?.getT1() ?? 0) > HALF_A_MINUTE) {
			return await this.makeFindCall(namespace, name);
		}

		return this.internalCache.get(key)?.getT2();
	}

	private filterFromCache(name: string): string[] {
		return this.internalFilterCache!.filter(
			e => e.toLowerCase().indexOf(name.toLowerCase()) !== -1,
		);
	}

	private makeFilterCall(): Promise<string[]> {
		return new Promise((resolve, reject) => {
			const headers: any = {};
			const authToken = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);
			if (authToken) headers.Authorization = authToken;
			if (globalThis.isDebugMode)
				headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();

			axios
				.get(`${this.url}repositoryFilter`, {
					params: {
						appCode: this.appCode,
						clientCode: this.clientCode,
						includeKIRunRepos: this.includeKIRunRepos,
					},
					headers,
				})
				.then((json: any) => {
					this.internalFilterCache = json.data;
					this.filterCachedAt = Date.now();
					resolve(this.internalFilterCache ?? []);
				})
				.catch((e: any) => {
					console.error(e);
					reject(e);
				});
		});
	}

	public async filter(name: string): Promise<string[]> {
		if (this.internalFilterCache) {
			if (Date.now() - this.filterCachedAt > HALF_A_MINUTE)
				this.makeFilterCall().then(v => {});
			return Promise.resolve(this.filterFromCache(name));
		}

		await this.makeFilterCall();
		return Promise.resolve(this.filterFromCache(name));
	}

	public static getRemoteFunctionRepository(
		appCode: string | undefined,
		clientCode: string | undefined,
		includeKIRunRepos = false,
		repoServer = REPO_SERVER.CORE,
	): RemoteRepository<Function> {
		const key = `${appCode}_${clientCode}_${includeKIRunRepos}_${repoServer}`;

		if (functionRepoCache.has(key)) return functionRepoCache.get(key)!;

		let repo = new RemoteRepository<Function>(
			appCode,
			clientCode,
			(jsonDef: any) => {
				if (isNullValue(jsonDef?.definition)) return undefined;
				const fd: FunctionDefinition = FunctionDefinition.from(jsonDef.definition);
				if (repoServer === REPO_SERVER.CORE)
					return new RemoteFunction(appCode, clientCode, fd, repoServer);
				else return new KIRuntime(fd, isDesignMode || isDebugMode);
			},
			includeKIRunRepos,
			REPO_TYPE.FUNCTION,
			repoServer,
		);

		functionRepoCache.set(key, repo);
		return repo;
	}

	public static getRemoteSchemaRepository(
		appCode: string | undefined,
		clientCode: string | undefined,
		includeRemoteKIRunSchemas = false,
		repoServer = REPO_SERVER.CORE,
	): RemoteRepository<Schema> {
		const key = `${appCode}_${clientCode}_${includeRemoteKIRunSchemas}_${repoServer}`;

		if (schemaRepoCache.has(key)) return schemaRepoCache.get(key)!;

		let repo = new RemoteRepository<Schema>(
			appCode,
			clientCode,
			(jsonDef: any) => {
				if (isNullValue(jsonDef)) return undefined;
				return Schema.from(jsonDef);
			},
			includeRemoteKIRunSchemas,
			REPO_TYPE.FUNCTION,
			repoServer,
		);

		schemaRepoCache.set(key, repo);
		return repo;
	}
}

export class RemoteFunction extends AbstractFunction {
	private fd: FunctionDefinition;
	private type: REPO_SERVER;
	private appCode: string | undefined;
	private clientCode: string | undefined;

	constructor(
		appCode: string | undefined,
		clientCode: string | undefined,
		fd: FunctionDefinition,
		type: REPO_SERVER,
	) {
		super();
		this.fd = fd;
		this.type = type;
		this.appCode = appCode;
		this.clientCode = clientCode;
	}

	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const headers: any = {};

		if (this.appCode) headers.appCode = this.appCode;
		if (this.clientCode) headers.clientCode = this.clientCode;

		const authToken = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);
		if (authToken) headers.Authorization = authToken;
		if (globalThis.isDebugMode)
			headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') + shortUUID();

		let response = await axios.post(
			`${getUrlPrefix()}api/core/function/execute/${this.fd.getNamespace()}/${this.fd.getName()}`,
			Array.from((context.getArguments() ?? new Map()).entries()).reduce((a, [k, v]) => {
				a[k] = v;
				return a;
			}, {} as any),
			{
				headers,
			},
		);

		if (!response.data) {
			return new FunctionOutput([EventResult.outputOf(new Map())]);
		}

		return new FunctionOutput(
			response.data.map((e: any) =>
				EventResult.of(e.name, new Map(Object.entries(e.result))),
			),
		);
	}

	getSignature(): FunctionSignature {
		return this.fd;
	}
}
