import React from 'react';
import { cyrb53 } from '../../util/cyrb53';
import { MarkdownParserParameters, MarkdownParserReturnValue, MDDef } from './common';
import { parseAttributes } from './utils';

export function parseCodeBlock(params: MarkdownParserParameters): MarkdownParserReturnValue {
	const { lineNumber: i, lines, styles } = params;
	let lineNumber = i;

	const codeLines: string[] = [];
	const language = lines[i]
		.substring(params.indentationLength ?? 0)
		.slice(3)
		.trim();
	let j = i + 1;

	for (; j < lines.length; j++) {
		const jthLine = lines[j].substring(params.indentationLength ?? 0);
		if (jthLine.startsWith('```')) break;
		codeLines.push(jthLine);
	}
	lineNumber = j;

	let style = styles.codeBlock;
	const attrs = parseAttributes(lines[lineNumber + 1]?.substring(params.indentationLength ?? 0));
	if (attrs) {
		lineNumber++;
		if (attrs.style) {
			style = style ? { ...style, ...attrs.style } : attrs.style;
		}
	}

	const key = cyrb53(lines.slice(lineNumber, i).join('\n') + ' - ' + lineNumber + ' - ' + i);
	const comp = {
		type: 'code',
		start: 0,
		end: 0,
		text: codeLines.join('\n'),
		marker: '',
		attributes: attrs,
		lineNumber: i,
		toLineNumber: j - 1,
		children: hilightFunctionMap.has(language)
			? hilightFunctionMap.get(language)?.(
				language,
				codeLines,
				styles,
				params.indentationLength ?? 0,
				i, j - 1
			) : undefined
	};


	return { lineNumber, comp: [comp] };
}

interface KeywordMap {
	keywords: string;
	set: Set<string> | undefined;
}
const JS_KEYWORDS: KeywordMap = {
	keywords:
		'break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,new,return,super,switch,this,throw,try,typeof,var,void,while,with,yield,enum,implements,interface,let,package,private,protected,public,static,await,abstract,boolean,byte,char,double,final,float,goto,int,long,native,short,synchronized,throws,transient,volatile,null,true,false,undefined,nan,infinity,array,date,eval,function,hasownproperty,infinity,isfinite,isnan,isprototypeof,length,math,nan,name,number,object,prototype,string,tostring,undefined,valueof,alert,all,anchor,anchors,area,assign,blur,button,checkbox,clearinterval,cleartimeout,clientinformation,close,closed,confirm,constructor,crypto,decodeuri,decodeuricomponent,defaultstatus,document,element,elements,embed,embeds,encodeuri,encodeuricomponent,escape,event,fileupload,focus,form,forms,frame,innerheight,innerwidth,layer,layers,link,location,mimetypes,navigate,navigator,frames,framerate,hidden,history,image,images,offscreenbuffering,open,opener,option,outerheight,outerwidth,packages,pagexoffset,pageyoffset,parent,parsefloat,parseint,password,pkcs11,plugin,prompt,propertyisenum,radio,reset,screenx,screeny,scroll,secure',
	set: undefined,
};

const JAVA_KEYWORDS: KeywordMap = {
	keywords:
		'abstract,assert,boolean,break,byte,case,catch,char,class,const,continue,default,do,double,else,enum,extends,final,finally,float,for,goto,if,implements,import,instanceof,int,interface,long,native,new,package,private,protected,public,return,short,static,strictfp,super,switch,synchronized,this,throw,throws,transient,try,void,volatile,while,true,false,null',
	set: undefined,
};

const PYTHON_KEYWORDS: KeywordMap = {
	keywords:
		'false,none,true,and,as,assert,async,await,break,class,continue,def,del,elif,else,except,finally,for,from,global,if,import,in,is,lambda,nonlocal,not,or,pass,raise,return,try,while,with,yield',
	set: undefined,
};

const C_KEYWORDS: KeywordMap = {
	keywords:
		'auto,break,case,char,const,continue,default,do,double,else,enum,extern,float,for,goto,if,int,long,register,return,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile,while',
	set: undefined,
};

const CPP_KEYWORDS: KeywordMap = {
	keywords:
		'alignas,alignof,and,and_eq,asm,atomic_cancel,atomic_commit,atomic_noexcept,auto,bitand,bitor,bool,break,case,catch,char,char8_t,char16_t,char32_t,class,compl,concept,const,consteval,constexpr,constinit,const_cast,continue,co_await,co_return,co_yield,decltype,default,delete,do,double,dynamic_cast,else,enum,explicit,export,extern,false,float,for,friend,goto,if,inline,int,long,mutable,namespace,new,noexcept,not,not_eq,nullptr,operator,or,or_eq,private,protected,public,reflexpr,register,reinterpret_cast,requires,return,short,signed,sizeof,static,static_assert,static_cast,struct,switch,synchronized,template,this,thread_local,throw,true,try,typedef,typeid,typename,union,unsigned,using,virtual,void,volatile,wchar_t,while,xor,xor_eq',
	set: undefined,
};

const C_SHARP_KEYWORDS: KeywordMap = {
	keywords:
		'abstract,as,base,bool,break,byte,case,catch,char,checked,class,const,continue,decimal,default,delegate,do,double,else,enum,event,explicit,extern,false,finally,fixed,float,for,foreach,goto,if,implicit,in,int,interface,internal,is,lock,long,namespace,new,null,object,operator,out,override,params,private,protected,public,readonly,ref,return,sbyte,sealed,short,sizeof,stackalloc,static,string,struct,switch,this,throw,true,try,typeof,uint,ulong,unchecked,unsafe,ushort,using,virtual,void,volatile,while',
	set: undefined,
};

const sourceMap = new Map([
	['javascript', JS_KEYWORDS],
	['js', JS_KEYWORDS],
	['java', JAVA_KEYWORDS],
	['python', PYTHON_KEYWORDS],
	['c', C_KEYWORDS],
	['cpp', CPP_KEYWORDS],
	['csharp', C_SHARP_KEYWORDS],
	['c#', C_SHARP_KEYWORDS],
]);

const hilightFunctionMap = new Map<
	string,
	(
		langague: string,
		lines: string[],
		styles: any,
		indentationLength: number,
		lineNumber: number,
		toLineNumber: number,
	) => Array<MDDef>
>([
	['javascript', highLightKeyWords],
	['js', highLightKeyWords],
	['java', highLightKeyWords],
	['python', highLightKeyWords],
	['c', highLightKeyWords],
	['cpp', highLightKeyWords],
	['csharp', highLightKeyWords],
	['c#', highLightKeyWords],
	['html', highlightHTML],
	['css', highlightCSS],
]);

function highLightKeyWords(
	langague: string,
	lines: string[],
	styles: any,
	indentationLength: number,
	lineNumber: number,
	toLineNumber: number,
): Array<MDDef> {
	let keywordSet: Set<string> | undefined = sourceMap.get(langague)?.set;

	if (!keywordSet) {
		keywordSet = new Set<string>(sourceMap.get(langague)!.keywords.split(','));
		sourceMap.get(langague)!.set = keywordSet;
	}

	let current = '';
	const elements: Array<MDDef> = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].substring(indentationLength ?? 0);
		const words = line.split(' ');

		for (let j = 0; j < words.length; j++) {
			const word = words[j];
			if (keywordSet.has(word.toLowerCase())) {
				if (current)
					elements.push(
						{
							type: 'fragment',
							start: 0,
							end: 0,
							text: current,
							marker: '',
							attributes: undefined,
							children: undefined,
							lineNumber: lineNumber + i,
						});


				elements.push(
					{
						type: 'span',
						start: 0,
						end: 0,
						text: word,
						marker: '',
						attributes: { 'className': '_codeBlockKeywords' },
						children: undefined,
						lineNumber: lineNumber + i,
					});

				current = '';
			} else {
				current += `${word} `;
			}
		}

		if (current) {
			elements.push(
				{
					type: 'fragment',
					start: 0,
					end: 0,
					text: current,
					marker: '',
					attributes: undefined,
					children: undefined,
					lineNumber: lineNumber + i,
				});
			current = '';
		}

		elements.push(
			{
				type: 'br',
				start: 0,
				end: 0,
				text: '',
				marker: '',
				attributes: undefined,
				children: undefined,
				lineNumber: lineNumber + i,
			});
	}

	return elements;
}

function highlightHTML(langauge: string, lines: string[], styles: any, indentationLength: number, lineNumber: number, toLineNumber: number): Array<MDDef> {
	let current = '';
	const elements: Array<MDDef> = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		let start = -1;
		for (let j = 0; j < line.length; j++) {
			if (line[j] === '<') {
				if (current)
					elements.push(
						{
							type: 'fragment',
							start: 0,
							end: 0,
							text: current,
							marker: '',
							attributes: undefined,
							children: undefined,
							lineNumber: lineNumber + i,
						});
				current = '';
				start = j;
				continue;
			} else if (line[j] === '>') {
				const keyword = line.substring(start, j + 1);
				elements.push(
					{
						type: 'span',
						start: 0,
						end: 0,
						text: keyword,
						marker: '',
						attributes: { 'className': '_codeBlockKeywords' },
						children: undefined,
						lineNumber: lineNumber + i,
					});

				current = '';
				start = -1;
			} else if (start === -1) {
				current += line[j];
			}
		}

		if (current) {
			elements.push(
				{
					type: 'fragment',
					start: 0,
					end: 0,
					text: current,
					marker: '',
					attributes: undefined,
					children: undefined,
					lineNumber: lineNumber + i,
				});
			current = '';
		}

		elements.push(
			{
				type: 'br',
				start: 0,
				end: 0,
				text: '',
				marker: '',
				attributes: undefined,
				children: undefined,
				lineNumber: lineNumber + i,
			});
	}

	return elements;
}

function highlightCSS(
	langauge: string,
	lines: string[],
	styles: any,
	indentationLength: number,
	lineNumber: number,
	toLineNumber: number,
): Array<MDDef> {
	const elements: Array<MDDef> = [];

	const text = lines.join('\n');

	let start = 0;

	let ind = -1;

	while ((ind = text.indexOf('{', start)) !== -1) {
		const before = text.substring(start, ind + 1);
		elements.push({
			type: 'span',
			start: 0,
			end: 0,
			text: before,
			marker: '',
			attributes: { 'className': '_codeBlockKeywords' },
			lineNumber, toLineNumber
		});

		let end = text.indexOf('}', ind);
		if (end === -1) end = text.length;
		const styleProps = text.substring(ind + 1, end);

		elements.push({
			type: 'fragment',
			start: 0,
			end: 0,
			text: styleProps,
			marker: '',
			attributes: undefined,
			children: undefined,
			lineNumber, toLineNumber
		});

		elements.push({
			type: 'span',
			start: 0,
			end: 0,
			text: '}',
			marker: '',
			attributes: { 'className': '_codeBlockKeywords' },
			lineNumber, toLineNumber
		});
		start = end + 1;
	}

	return elements;
}
