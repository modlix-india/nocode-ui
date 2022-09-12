export const button = (key) => {
    return {
    name: 'simpleButton',
    key: key,
    component: 'Button',
    permissions: '',
    readOnly: '',
    visibility: '',
    props: {
        type: {
            // location: [],
            value: 'text' //could be text | outlined | contained
        },
        leftIcon: {
            // location: [],
            value: '',
        },
        rightIcon: {
            // location: [],
            value: '',
        },
        events: {
            onClick: {
                // location: [],
                value: '' // can call the event maps
            }
        }
    }
}}