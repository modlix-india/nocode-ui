import React from 'react';

export function App() {
    const [text, setText] = React.useState('');
    React.useEffect(() => {
       (async() => {
        const resp = await fetch('/api');
        const res: {name: string} = await resp.json();
        setText(res.name);
       })()
    }, []);
    return <>{text}!</>;
}