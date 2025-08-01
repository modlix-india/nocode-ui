import { Schema, SchemaType } from '@fincity/kirun-js';

export interface ButtonProps {}

export interface GridProps {}

export interface VerifyLoginResponse {
	isAuthenticated: boolean;
}

export const STORE_PREFIX = 'Store';
export const LOCAL_STORE_PREFIX = 'LocalStore';
export const PAGE_STORE_PREFIX = 'Page';
export const SAMPLE_STORE_PREFIX = 'SampleDataStore';
export const TEMP_STORE_PREFIX = 'Temp';

export const NAMESPACE_UI_ENGINE = 'UIEngine';
export const NAMESPACE_UI_COMPONENT = 'UIEngine.component';

export const STORE_PATH_FUNCTION_EXECUTION = 'Store.functionExecutions';
export const STORE_PATH_THEME_PATH = 'Store.theme';
export const STORE_PATH_STYLE_PATH = 'Store.style';
export const STORE_PATH_APP = 'Store.application';
export const STORE_PATH_MESSAGES = 'Store.messages';
export const STORE_PATH_APP_MESSAGE_TIMEOUT = 'Store.application.properties.messageTimeout';

export const SCHEMA_DATA_LOCATION = Schema.ofRef(`${NAMESPACE_UI_ENGINE}.DataLocation`);
export const SCHEMA_VALIDATION_TYPE = Schema.ofRef(`${NAMESPACE_UI_ENGINE}.ValidationType`);
export const SCHEMA_VALIDATION = Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Validation`);

export const SCHEMA_BOOL_COMP_PROP = Schema.of(SchemaType.BOOLEAN)
	.setName('BooleanComponentProperty')
	.setNamespace(NAMESPACE_UI_ENGINE);
export const SCHEMA_STRING_COMP_PROP = Schema.of(SchemaType.STRING)
	.setName('StringComponentProperty')
	.setNamespace(NAMESPACE_UI_ENGINE);
export const SCHEMA_NUM_COMP_PROP = Schema.of(SchemaType.INTEGER)
	.setName('NumberComponentProperty')
	.setNamespace(NAMESPACE_UI_ENGINE);
export const SCHEMA_ANY_COMP_PROP =
	Schema.ofAny('AnyComponentProperty').setNamespace(NAMESPACE_UI_ENGINE);

export const EMPTY_STRING = '';

export const GLOBAL_CONTEXT_NAME = '_global';

export const DRAG_CD_KEY = 'COMPONENT_DEFINITION_DRAG_';
export const DRAG_PROP_MV_KEY = 'MULTIVALUED_PROP_DRAG_';
export const DRAG_COMP_NAME = 'COMPOENT_NAME_DRAG_';
export const COPY_CD_KEY = 'COMPONENT_DEFINITION_COPY_';
export const CUT_CD_KEY = 'COMPONENT_DEFINITION_CUT_';
export const COPY_STMT_KEY = 'KIRUN_STMT_COPY_';
export const TEMPLATE_DRAG = 'TEMPLATE_DRAG_';

export const COPY_FUNCTION_KEY = 'FUNCTION_DEFINITION_COPY_';
export const COPY_STYLE_PROPS_KEY = 'STYLE_PROPS_COPY_';
