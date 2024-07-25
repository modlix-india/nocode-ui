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

const url = getDataFromPath(`${STORE_PREFIX}.url`, []);
const URL_PREFIX =
	url.appCode && url.clientCode ? `/${url.appCode}/${url.clientCode}/page/repos/` : '';

export class RemoteRepository<T> implements Repository<T> {
	private url: string;

	private internalCache: Map<string, Tuple2<number, T>> = new Map();
	private internalFilterCache: Array<string> | undefined = undefined;
	private promiseCache: Map<string, Promise<T | undefined>> = new Map();
	private filterCachedAt: number = 0;

	private jsonConversion: (json: any) => T | undefined;
	private appCode: string | undefined;
	private clientCode: string | undefined;
	private includeKIRunRepos: boolean;

	constructor(
		appCode: string | undefined,
		clientCode: string | undefined,
		jsonConversion: (json: any) => T | undefined,
		includeKIRunRepos = false,
		repoType = REPO_TYPE.FUNCTION,
		repoServer = REPO_SERVER.CORE,
	) {
		this.url = `${URL_PREFIX}api/${repoServer.toLowerCase()}/${repoType}/`;
		this.jsonConversion = jsonConversion;
		this.appCode = appCode;
		this.clientCode = clientCode;
		this.includeKIRunRepos = includeKIRunRepos;
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
			if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();
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
			if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();

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
		if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();

		let response = await axios.post(
			`${URL_PREFIX}api/core/function/execute/${this.fd.getNamespace()}/${this.fd.getName()}`,
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
