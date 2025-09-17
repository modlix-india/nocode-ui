import React from 'react';
import { LANGUAGE_CODES } from '../commons';

export default function EmailEditor({
	template = {},
	onChange,
}: Readonly<{
	template: any;
	onChange: (template: any) => void;
}>) {
	const [currentLanguage, setCurrentLanguage] = React.useState<string>('en');

	return (
        <div className="editor">
            <div className="textEditors">
                <div className="language">
                    Language: <select
                        value={currentLanguage}
                        onChange={v => setCurrentLanguage(v.target.value)}
                    >
                        {LANGUAGE_CODES.map(e => (
                            <option key={e} value={e}>
                                {e}
                            </option>
                        ))}
                    </select>
                </div>
                <span className="label">Title :</span>
                <input
                    value={template[currentLanguage]?.title ?? ''}
                    onChange={v =>
                        onChange({
                            ...template,
                            [currentLanguage]: {
                                body: template?.[currentLanguage]?.body ?? '',
                                title: v.target.value,
                            },
                        })
                    }
                />
                <span className="label">Description :</span>
                <textarea
                    value={template[currentLanguage]?.description ?? ''}
                    onChange={v =>
                        onChange({
                            ...template,
                            [currentLanguage]: {
                                description: v.target.value,
                                title: template?.[currentLanguage]?.title ?? '',
                            },
                        })
                    }
                ></textarea>
            </div>
        </div>
	);
}