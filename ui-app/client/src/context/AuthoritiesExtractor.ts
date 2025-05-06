import { SpecialTokenValueExtractor } from './SpecialTokenValueExtractor';

export class AuthoritiesExtractor extends SpecialTokenValueExtractor {
	private store: any;
	
	public setStore(store: any) {
		this.store = store;
	}

	protected getValueInternal(token: string) {
		const trimmedToken = token.trim();
		return (this.store.auth?.user?.stringAuthorities?.findIndex((e : string) => e == trimmedToken) ?? -1) !== -1;
	}

	getPrefix(): string {
		return 'Authorities.';
	}

	public getStore(): any {
		return this.store;
	}
}
