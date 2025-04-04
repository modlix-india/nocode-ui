import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdownParserParameters, MarkdownParserReturnValue } from './common';
import { parseInline } from './parseInline';
import { parseAttributes } from './utils';

export function parseLine(
  params: MarkdownParserParameters & { line?: string },
): MarkdownParserReturnValue {
  const { lines, lineNumber: i, styles, line, onChange, editable } = params;
  const key = `${cyrb53(line ?? lines[i])}-${i}`;
  let lineNumber = i;
  let style = styles.p;
  const attrs = parseAttributes(lines[lineNumber + 1]);
  
  if (attrs) {
    lineNumber++;
  }

  let currentLine = (line ?? lines[i]).substring(params.indentationLength ?? 0);
  
  const styleRegex = /\{style="([^"]+)"\}(.*?)\{style\}/g;
  let processedLine = currentLine;
  let segments: Array<{text: string; style: Record<string, string>}> = [];
  let lastIndex = 0;

  const matches = Array.from(currentLine.matchAll(styleRegex));
  for (const match of matches) {
    const [fullMatch, styleText, content] = match;
    const matchIndex = match.index!;
    
    if (matchIndex > lastIndex) {
      segments.push({
        text: processedLine.substring(lastIndex, matchIndex),
        style: style || {}
      });
    }
    
    const styleObj = parseStyleText(styleText);
    segments.push({
      text: content,
      style: { ...style, ...styleObj }
    });
    
    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < processedLine.length) {
    segments.push({
      text: processedLine.substring(lastIndex),
      style: style || {}
    });
  }

  const handleContentChange = (ev: React.FormEvent<HTMLParagraphElement>) => {
    if (!onChange) return;
    const updatedContent = ev.currentTarget.textContent || '';
    
    let newContent = updatedContent;
    if (matches.length > 0) {
      const originalStyles = matches.map(match => ({
        style: match[1],
        content: match[2]
      }));
      
      newContent = `{style="${originalStyles[0].style}"}${updatedContent}{style}`;
    }

    const updatedLines = [...lines];
    updatedLines[i] = newContent;
    onChange(updatedLines.join('\n'));
  };

  const children = segments.map((segment, index) => 
    React.createElement('span', {
      key: `${key}-segment-${index}`,
      style: segment.style
    }, parseInline({ ...params, line: segment.text }))
  );

  const comp = React.createElement(
    'p',
    {
      key,
      className: '_p',
      ...(attrs ?? {}),  
      style: {
        ...style,  
        ...(attrs?.style || {})  
      },
      ...(editable
        ? {
            contentEditable: true,
            onInput: handleContentChange,
            suppressContentEditableWarning: true,
          }
        : {}),
    },
    children
  );

  return { lineNumber, comp };
}

function parseStyleText(styleText: string): Record<string, string> {
  const styleObj: Record<string, string> = {};
  const styles = styleText.split(',');
  
  for (const style of styles) {
    const [property, value] = style.split(':').map(s => s.trim());
    if (property && value) {
      // Convert property names to camelCase for React
      const camelProperty = property.replace(/-([a-z])/g, g => g[1].toUpperCase());
      styleObj[camelProperty] = value;
    }
  }
  
  return styleObj;
}
