export interface ButtonProps {}

export interface GridProps {}

export interface VerifyLoginResponse {
	isAuthenticated: boolean;
}

export const STORE_PREFIX = 'Store';
export const LOCAL_STORE_PREFIX = 'LocalStore';
export const PAGE_STORE_PREFIX = 'Page';

export const NAMESPACE_UI_ENGINE = 'UIEngine';
export const NAMESPACE_UI_COMPONENT = 'UIEngine.component';

export const STORE_PATH_FUNCTION_EXECUTION = 'Store.functionExecutions';
export const STORE_PATH_THEME_PATH = 'Store.theme';
export const STORE_PATH_STYLE_PATH = 'Store.style';
export const STORE_PATH_APP = 'Store.application';

export const SCHEMA_REF_DATA_LOCATION = `${NAMESPACE_UI_ENGINE}.DataLocation`;
export const SCHEMA_REF_VALIDATION_TYPE = `${NAMESPACE_UI_ENGINE}.ValidationType`;
export const SCHEMA_REF_BOOL_COMP_PROP = `${NAMESPACE_UI_ENGINE}.BooleanComponentProperty`;
export const SCHEMA_REF_STRING_COMP_PROP = `${NAMESPACE_UI_ENGINE}.StringComponentProperty`;
export const SCHEMA_REF_NUM_COMP_PROP = `${NAMESPACE_UI_ENGINE}.NumberComponentProperty`;
export const SCHEMA_REF_ANY_COMP_PROP = `${NAMESPACE_UI_ENGINE}.AnyComponentProperty`;

export const EMPTY_STRING = '';
