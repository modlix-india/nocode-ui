import { v4 as uuidv4 } from 'uuid';
import { button } from './Button.js';

export const login = {
    name: 'login',
    key: uuidv4(),
    applicationName: 'UI Engine',
    title: 'UI Engine - Login',
    shell: false,
    permissions: '',
    components: {
        loginButton: button(uuidv4())
    },
    events: {},
    widgets: {},
}