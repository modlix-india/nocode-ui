import { useRef } from "react";
import { shortUUID } from "../../../util/shortUUID";
import axios from "axios";
import { getDataFromPath } from "../../../context/StoreContext";
import { LOCAL_STORE_PREFIX } from "../../../constants";

export function TextModeEditor(
    {
        text,
        onChangeText,
        onSelectionChange,
        styleProperties,
        pathForPastedFiles,
        onBlur,
    }: Readonly<{
        text: string;
        onChangeText: (newText: string, callback?: () => void) => void;
        onSelectionChange: React.Dispatch<React.SetStateAction<{
            start: number;
            end: number;
        } | null>>;
        styleProperties: Record<string, any>;
        pathForPastedFiles: string;
        onBlur: () => {} | undefined;
    }>
) {

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    return <textarea
        ref={textAreaRef}
        value={text}
        style={styleProperties.textArea ?? {}}
        onSelect={e => {
            const { selectionStart: start, selectionEnd: end } = textAreaRef.current!;
            onSelectionChange((r) => {
                if (r?.start == start && r?.end == end) return r;
                return { start, end };
            });
        }}
        onBlur={onBlur}
        onChange={ev => onChangeText(ev.target.value)}
        onKeyDown={ev => {
            if (ev.key === 'Tab') {
                ev.preventDefault();
                const { selectionStart, selectionEnd } = textAreaRef.current!;
                const newText = `${text.substring(0, selectionStart)}    ${text.substring(
                    selectionEnd,
                )}`;
                onChangeText(newText, () =>
                    textAreaRef.current!.setSelectionRange(
                        selectionStart + 4,
                        selectionStart + 4,
                    ),
                );
            }
        }}
        onPaste={ev => {
            ev.preventDefault();

            if (!textAreaRef.current) return;

            if (ev.clipboardData.files.length) {
                const file = ev.clipboardData.files[0];
                const formData = new FormData();
                formData.append('file', file);
                const fileNamePrefix = `pasted_${shortUUID()}_`;
                formData.append('name', fileNamePrefix);

                const headers: any = {
                    Authorization: getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []),
                };
                if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();

                (async () => {
                    try {
                        let url = `/api/files/static/${pathForPastedFiles}`;
                        let data = await axios.post(url, formData, {
                            headers,
                        });
                        if (data.status === 200) {
                            const { selectionStart, selectionEnd } = textAreaRef.current!;
                            const paste = data.data.url;
                            const newText = `${text.substring(0, selectionStart)}![](${paste})${text.substring(
                                selectionEnd,
                            )}`;
                            onChangeText(newText, () =>
                                textAreaRef.current!.setSelectionRange(
                                    selectionStart + paste.length + 4,
                                    selectionStart + paste.length + 4,
                                ),
                            );
                        }
                    } catch (e) { }
                })();
            } else {
                const paste = ev.clipboardData.getData('text');
                const { selectionStart, selectionEnd } = textAreaRef.current!;
                const newText = `${text.substring(0, selectionStart)}${paste}${text.substring(
                    selectionEnd,
                )}`;
                onChangeText(newText, () =>
                    textAreaRef.current!.setSelectionRange(
                        selectionStart + paste.length,
                        selectionStart + paste.length,
                    ),
                );
            }
        }}
    />;
} 