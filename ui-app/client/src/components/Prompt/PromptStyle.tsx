import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './promptStyleProperties';

const PREFIX = '.comp.compPrompt';

export default function PromptStyle({
	theme,
}: Readonly<{ theme: Map<string, Map<string, string>> }>) {
	const css =
		`
		${PREFIX} {
			display: flex;
			flex-direction: row;
			height: 100%;
			overflow: hidden;
			background: #fff;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		}

		/* ─── Session Sidebar ─── */
		${PREFIX} ._sessionSidebar {
			width: 260px;
			height: 100%;
			background: #f9f9f9;
			border-right: 1px solid #e5e5e5;
			display: flex;
			flex-direction: column;
			flex-shrink: 0;
			position: relative;
			overflow: hidden;
			transition: width 0.2s ease, margin-left 0.2s ease, opacity 0.2s ease;
		}

		/* Sidebar resize handle */
		${PREFIX} ._sidebarResizeHandle {
			position: absolute;
			right: 0;
			top: 0;
			bottom: 0;
			width: 4px;
			cursor: col-resize;
			background: transparent;
			z-index: 5;
			transition: background 0.15s;
		}

		${PREFIX} ._sidebarResizeHandle:hover,
		${PREFIX} ._sidebarResizeHandle:active {
			background: #d0d0d0;
		}

		${PREFIX} ._sessionSidebar._collapsed {
			width: 0 !important;
			margin-left: 0;
			border-right: none;
			opacity: 0;
			pointer-events: none;
		}

		${PREFIX} ._sidebarHeader {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 12px 14px;
			flex-shrink: 0;
			position: relative;
		}

		${PREFIX} ._newChatButton {
			display: flex;
			align-items: center;
			gap: 8px;
			border: none;
			background: transparent;
			color: #1a1a1a;
			font-size: 14px;
			font-weight: 500;
			cursor: pointer;
			padding: 8px 12px;
			border-radius: 8px;
			transition: background 0.15s;
			position: relative;
		}

		${PREFIX} ._newChatButton:hover {
			background: #ececec;
		}

		${PREFIX} ._newChatButton i {
			font-size: 12px;
		}

		${PREFIX} ._sessionGroup {
			flex: 1;
			overflow-y: auto;
			padding: 0 8px;
		}

		${PREFIX} ._sessionGroupLabel {
			font-size: 11px;
			font-weight: 600;
			color: #9b9b9b;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			padding: 8px 8px 6px;
		}

		${PREFIX} ._sessionItems {
			display: flex;
			flex-direction: column;
			gap: 1px;
		}

		${PREFIX} ._sessionItem {
			display: block;
			width: 100%;
			text-align: left;
			border: none;
			background: transparent;
			color: #1a1a1a;
			font-size: 14px;
			padding: 10px 12px;
			border-radius: 8px;
			cursor: pointer;
			transition: background 0.15s;
			overflow: hidden;
			position: relative;
		}

		${PREFIX} ._sessionItem:hover {
			background: #ececec;
		}

		${PREFIX} ._sessionItem._active {
			background: #ececec;
			font-weight: 500;
		}

		${PREFIX} ._sessionTitle {
			display: block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		${PREFIX} ._loadMoreSessions {
			display: block;
			width: 100%;
			text-align: center;
			border: none;
			background: transparent;
			color: #6b6b6b;
			font-size: 13px;
			padding: 10px 12px;
			cursor: pointer;
			transition: background 0.15s, color 0.15s;
			border-radius: 8px;
		}

		${PREFIX} ._loadMoreSessions:hover {
			background: #ececec;
			color: #1a1a1a;
		}

		${PREFIX} ._loadMoreSessions:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		/* Session action buttons (visible on hover) */
		${PREFIX} ._sessionActions {
			position: absolute;
			right: 8px;
			top: 50%;
			transform: translateY(-50%);
			display: none;
			align-items: center;
			gap: 2px;
		}

		${PREFIX} ._sessionItem:hover ._sessionActions {
			display: flex;
		}

		${PREFIX} ._renameSessionButton,
		${PREFIX} ._deleteSessionButton {
			width: 24px;
			height: 24px;
			border: none;
			background: transparent;
			color: #9b9b9b;
			cursor: pointer;
			border-radius: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 11px;
			padding: 0;
			transition: background 0.15s, color 0.15s;
		}

		${PREFIX} ._renameSessionButton:hover {
			background: #ddd;
			color: #1a1a1a;
		}

		${PREFIX} ._deleteSessionButton:hover {
			background: #ddd;
			color: #dc3545;
		}

		/* In-place rename input */
		${PREFIX} ._sessionRenameInput {
			width: 100%;
			border: 1px solid #d0d0d0;
			border-radius: 4px;
			padding: 4px 8px;
			font-size: 14px;
			font-family: inherit;
			color: #1a1a1a;
			background: #fff;
			outline: none;
		}

		${PREFIX} ._sessionRenameInput:focus {
			border-color: #999;
		}

		/* Delete confirmation dialog */
		${PREFIX} ._deleteConfirmOverlay {
			position: fixed;
			inset: 0;
			z-index: 100;
			background: rgba(0, 0, 0, 0.4);
			display: flex;
			align-items: center;
			justify-content: center;
		}

		${PREFIX} ._deleteConfirmDialog {
			background: #fff;
			border-radius: 12px;
			padding: 20px 24px;
			max-width: 340px;
			width: 90%;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		}

		${PREFIX} ._deleteConfirmText {
			font-size: 14px;
			color: #1a1a1a;
			margin: 0 0 16px;
			line-height: 1.5;
		}

		${PREFIX} ._deleteConfirmActions {
			display: flex;
			justify-content: flex-end;
			gap: 8px;
		}

		${PREFIX} ._deleteConfirmCancel,
		${PREFIX} ._deleteConfirmDelete {
			padding: 8px 16px;
			border-radius: 8px;
			font-size: 13px;
			font-weight: 500;
			cursor: pointer;
			border: none;
			transition: background 0.15s;
		}

		${PREFIX} ._deleteConfirmCancel {
			background: #f4f4f4;
			color: #1a1a1a;
		}

		${PREFIX} ._deleteConfirmCancel:hover {
			background: #e5e5e5;
		}

		${PREFIX} ._deleteConfirmDelete {
			background: #dc3545;
			color: #fff;
		}

		${PREFIX} ._deleteConfirmDelete:hover {
			background: #c82333;
		}

		${PREFIX} ._sidebarOverlay {
			display: none;
		}

		@media (max-width: 768px) {
			${PREFIX} ._sessionSidebar {
				position: absolute;
				z-index: 20;
				width: 260px;
				transform: translateX(-100%);
				transition: transform 0.2s ease;
				box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
				opacity: 1;
				pointer-events: auto;
			}

			${PREFIX} ._sessionSidebar._collapsed {
				width: 260px;
				margin-left: 0;
				border-right: 1px solid #e5e5e5;
				opacity: 1;
				pointer-events: auto;
				transform: translateX(-100%);
			}

			${PREFIX} ._sessionSidebar._open {
				transform: translateX(0);
			}

			${PREFIX} ._sidebarOverlay {
				display: block;
				position: absolute;
				inset: 0;
				z-index: 19;
				background: rgba(0, 0, 0, 0.3);
			}
		}

		/* ─── Main area ─── */
		${PREFIX} ._promptMain {
			flex: 1;
			display: flex;
			flex-direction: column;
			min-width: 0;
			overflow: hidden;
		}

		/* Top bar */
		${PREFIX} ._promptTopBar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 8px 12px;
			flex-shrink: 0;
		}

		${PREFIX} ._sidebarToggle,
		${PREFIX} ._newChatTopButton {
			width: 36px;
			height: 36px;
			border: none;
			background: transparent;
			color: #6b6b6b;
			cursor: pointer;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 16px;
			padding: 0;
			transition: background 0.15s, color 0.15s;
		}

		${PREFIX} ._sidebarToggle:hover,
		${PREFIX} ._newChatTopButton:hover {
			background: #f4f4f4;
			color: #1a1a1a;
		}

		/* ─── Messages area ─── */
		${PREFIX} ._promptMessages {
			flex: 1;
			overflow-y: auto;
			overflow-x: hidden;
			position: relative;
		}

		${PREFIX} ._promptMessagesInner {
			max-width: 768px;
			margin: 0 auto;
			padding: 24px 16px;
			display: flex;
			flex-direction: column;
			gap: 24px;
		}

		/* Empty state */
		${PREFIX} ._emptyState {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 200px;
		}

		${PREFIX} ._emptyTitle {
			font-size: 24px;
			font-weight: 600;
			color: #1a1a1a;
			margin: 0;
		}

		${PREFIX} ._loadEarlierMessages {
			display: block;
			width: 100%;
			text-align: center;
			border: none;
			background: transparent;
			color: #6b6b6b;
			font-size: 13px;
			padding: 10px 12px;
			cursor: pointer;
			transition: background 0.15s, color 0.15s;
			border-radius: 8px;
			margin-bottom: 8px;
		}

		${PREFIX} ._loadEarlierMessages:hover {
			background: #f4f4f4;
			color: #1a1a1a;
		}

		${PREFIX} ._loadEarlierMessages:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		/* ─── User message ─── */
		${PREFIX} ._promptMessage._user {
			align-self: flex-end;
			max-width: 75%;
			padding: 10px 16px;
			background: #f4f4f4;
			color: #1a1a1a;
			border-radius: 20px;
			font-size: 15px;
			line-height: 1.6;
			word-wrap: break-word;
			position: relative;
		}

		/* ─── Assistant message ─── */
		${PREFIX} ._promptMessage._assistant {
			display: flex;
			align-items: flex-start;
			gap: 12px;
			align-self: flex-start;
			width: 100%;
			position: relative;
		}

		${PREFIX} ._assistantContent {
			flex: 1;
			min-width: 0;
			font-size: 15px;
			line-height: 1.7;
			color: #1a1a1a;
		}

		${PREFIX} ._assistantContent p {
			margin: 0 0 12px 0;
		}

		${PREFIX} ._assistantContent p:last-child {
			margin-bottom: 0;
		}

		${PREFIX} ._assistantContent code {
			background: #f4f4f4;
			padding: 2px 5px;
			border-radius: 4px;
			font-size: 0.88em;
			font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
		}

		${PREFIX} ._assistantContent pre {
			background: #1e1e1e;
			color: #d4d4d4;
			padding: 16px;
			border-radius: 8px;
			overflow-x: auto;
			margin: 12px 0;
			font-size: 13px;
			line-height: 1.5;
		}

		${PREFIX} ._assistantContent pre code {
			background: none;
			padding: 0;
			color: inherit;
			font-size: inherit;
		}

		${PREFIX} ._assistantContent ul,
		${PREFIX} ._assistantContent ol {
			padding-left: 20px;
			margin: 8px 0;
		}

		${PREFIX} ._assistantContent li {
			margin-bottom: 4px;
		}

		/* ─── Thinking block ─── */
		${PREFIX} ._thinkingBlock {
			max-width: 768px;
			border-radius: 12px;
			font-size: 13px;
			margin-bottom: 4px;
			align-self: flex-start;
		}

		${PREFIX} ._thinkingHeader {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 8px 12px;
			border: none;
			background: none;
			font: inherit;
			color: inherit;
			width: 100%;
			text-align: left;
			cursor: pointer;
			border-radius: 8px;
		}

		${PREFIX} ._thinkingHeader:hover {
			background: #f4f4f4;
		}

		${PREFIX} ._thinkingHeader i,
		${PREFIX} ._thinkingChevron {
			font-size: 10px;
			color: #9b9b9b;
		}

		${PREFIX} ._thinkingChevron {
			margin-left: auto;
		}

		${PREFIX} ._thinkingDots {
			display: flex;
			gap: 4px;
		}

		${PREFIX} ._thinkingDots span {
			width: 6px;
			height: 6px;
			border-radius: 50%;
			background: #8b8b8b;
			animation: promptThinkingBounce 1.4s ease-in-out infinite;
		}

		${PREFIX} ._thinkingDots span:nth-child(2) {
			animation-delay: 0.2s;
		}

		${PREFIX} ._thinkingDots span:nth-child(3) {
			animation-delay: 0.4s;
		}

		@keyframes promptThinkingBounce {
			0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
			40% { opacity: 1; transform: scale(1); }
		}

		${PREFIX} ._thinkingLabel {
			font-size: 13px;
			color: #8b8b8b;
			font-style: italic;
		}

		${PREFIX} ._thinkingBody {
			padding: 0 0 8px 20px;
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		${PREFIX} ._thinkingToolRow {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 4px 0;
			font-size: 12px;
			color: #666;
		}

		${PREFIX} ._thinkingToolIcon {
			font-size: 10px;
			flex-shrink: 0;
		}

		${PREFIX} ._thinkingToolRow._running ._thinkingToolIcon {
			color: #6c757d;
		}

		${PREFIX} ._thinkingToolRow._success ._thinkingToolIcon {
			color: #198754;
		}

		${PREFIX} ._thinkingToolRow._error ._thinkingToolIcon {
			color: #dc3545;
		}

		${PREFIX} ._thinkingToolName {
			font-weight: 500;
			color: #1a1a1a;
		}

		${PREFIX} ._thinkingToolSummary {
			color: #9b9b9b;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		/* Streaming cursor */
		${PREFIX} ._streamingCursor {
			display: inline-block;
			width: 2px;
			height: 18px;
			background: #1a1a1a;
			margin-left: 2px;
			vertical-align: text-bottom;
			animation: promptBlink 1s step-end infinite;
		}

		@keyframes promptBlink {
			0%, 100% { opacity: 1; }
			50% { opacity: 0; }
		}

		/* Message actions */
		${PREFIX} ._messageActions {
			display: flex;
			gap: 4px;
			margin-top: 8px;
		}

		${PREFIX} ._actionButton {
			width: 28px;
			height: 28px;
			border: none;
			background: transparent;
			color: #9b9b9b;
			cursor: pointer;
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 13px;
			transition: background 0.15s, color 0.15s;
			padding: 0;
		}

		${PREFIX} ._actionButton:hover {
			background: #f4f4f4;
			color: #1a1a1a;
		}

		/* ─── Message attachments ─── */
		${PREFIX} ._messageAttachments {
			display: flex;
			gap: 8px;
			flex-wrap: wrap;
			align-self: flex-end;
			max-width: 75%;
		}

		${PREFIX} ._attachmentPreview {
			border-radius: 12px;
			overflow: hidden;
		}

		${PREFIX} ._attachmentImage {
			max-width: 200px;
			max-height: 150px;
			border-radius: 12px;
			object-fit: cover;
		}

		${PREFIX} ._attachmentFile {
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 8px 12px;
			background: #f4f4f4;
			border-radius: 8px;
			font-size: 13px;
			color: #1a1a1a;
		}

		/* ─── Input area ─── */
		${PREFIX} ._promptInputWrapper {
			padding: 0 16px 16px;
		}

		${PREFIX} ._promptInputBar {
			max-width: 768px;
			margin: 0 auto;
			position: relative;
		}

		/* Input attachments preview */
		${PREFIX} ._inputAttachments {
			display: flex;
			gap: 8px;
			flex-wrap: wrap;
			padding: 8px 12px 0;
		}

		${PREFIX} ._inputAttachmentItem {
			position: relative;
			border-radius: 8px;
			overflow: hidden;
		}

		${PREFIX} ._inputAttachmentThumb {
			width: 64px;
			height: 64px;
			object-fit: cover;
			border-radius: 8px;
			display: block;
		}

		${PREFIX} ._inputAttachmentFile {
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 8px 12px;
			background: #f4f4f4;
			border-radius: 8px;
			font-size: 12px;
			color: #1a1a1a;
			max-width: 150px;
		}

		${PREFIX} ._inputAttachmentFile span {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		${PREFIX} ._removeAttachment {
			position: absolute;
			top: 2px;
			right: 2px;
			width: 20px;
			height: 20px;
			border: none;
			border-radius: 50%;
			background: rgba(0, 0, 0, 0.6);
			color: #fff;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 10px;
			padding: 0;
			transition: background 0.15s;
		}

		${PREFIX} ._removeAttachment:hover {
			background: rgba(0, 0, 0, 0.8);
		}

		${PREFIX} ._inputContainer {
			display: flex;
			align-items: flex-end;
			border: 1px solid #e5e5e5;
			border-radius: 24px;
			background: #f4f4f4;
			padding: 8px 12px 8px 8px;
			transition: border-color 0.15s, box-shadow 0.15s;
		}

		${PREFIX} ._inputContainer:focus-within {
			border-color: #d0d0d0;
			box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04);
			background: #fff;
		}

		/* Plus button for attachments */
		${PREFIX} ._addAttachmentButton {
			width: 32px;
			height: 32px;
			border: 1px solid #e0e0e0;
			border-radius: 50%;
			background: transparent;
			color: #6b6b6b;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 14px;
			padding: 0;
			flex-shrink: 0;
			transition: background 0.15s, color 0.15s, border-color 0.15s;
		}

		${PREFIX} ._addAttachmentButton:hover {
			background: #ececec;
			color: #1a1a1a;
			border-color: #ccc;
		}

		${PREFIX} ._addAttachmentButton:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}

		${PREFIX} ._inputContainer textarea {
			flex: 1;
			border: none;
			background: transparent;
			padding: 4px 8px;
			font-family: inherit;
			font-size: 15px;
			resize: none;
			outline: none;
			min-height: 24px;
			max-height: 200px;
			line-height: 1.5;
			color: #1a1a1a;
		}

		${PREFIX} ._inputContainer textarea::placeholder {
			color: #9b9b9b;
		}

		${PREFIX} ._inputActions {
			display: flex;
			align-items: center;
			gap: 4px;
			margin-left: 4px;
			flex-shrink: 0;
		}

		${PREFIX} ._sendButton {
			width: 32px;
			height: 32px;
			border: none;
			border-radius: 50%;
			background: #1a1a1a;
			color: #fff;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 14px;
			transition: opacity 0.15s;
			padding: 0;
			position: relative;
		}

		${PREFIX} ._sendButton:hover {
			opacity: 0.8;
		}

		${PREFIX} ._sendButton:disabled {
			background: #d0d0d0;
			cursor: not-allowed;
			opacity: 1;
		}

		${PREFIX} ._stopButton {
			width: 32px;
			height: 32px;
			border: none;
			border-radius: 50%;
			background: #1a1a1a;
			color: #fff;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 12px;
			transition: opacity 0.15s;
			padding: 0;
		}

		${PREFIX} ._stopButton:hover {
			opacity: 0.8;
		}

		/* Microphone / voice input button */
		${PREFIX} ._micButton {
			width: 32px;
			height: 32px;
			border-radius: 50%;
			border: none;
			background: transparent;
			color: #6b6b6b;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 14px;
			flex-shrink: 0;
			padding: 0;
			transition: background 0.2s, color 0.2s;
		}

		${PREFIX} ._micButton:hover {
			background: #ececec;
			color: #1a1a1a;
		}

		${PREFIX} ._micButton._recording {
			color: #ef4444;
			background: rgba(239, 68, 68, 0.1);
		}

		${PREFIX} ._micButton._recording:hover {
			background: rgba(239, 68, 68, 0.2);
		}

		${PREFIX} ._micButton:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}
	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="PromptCss">{css}</style>;
}
