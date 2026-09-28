/**
 * The shared geometry of `CommonCheckbox` and `CommonTriStateCheckbox`.
 *
 * These two spans are plain React chrome, not components: the page editor's
 * boolean properties, the schema form and schema builder, Dropdown's
 * multi-select ticks, TableGrid's row selection and RadioButton's dot are all
 * drawn with them. Nothing here is scoped to a component, and
 * `span.commonCheckbox.radio { border-radius: 50% }` is the only rule that
 * makes a radio round.
 *
 * It used to live inside `CheckBoxStyle`, which was harmless while AppStyle
 * emitted every component's CSS on every page. Now that a style block is only
 * emitted once its component has actually rendered, a page without a CheckBox
 * on it lost the block -- so page editor booleans collapsed to 0x0 and radios
 * came out square. It belongs in AppStyle, which is always emitted.
 *
 * Component-specific rules stay with their component: `.comp.compCheckbox` in
 * CheckBoxStyle, `.comp.compRadioButton` in RadioButtonStyle. Those selectors
 * are more specific, so they still win over anything here.
 */
export const COMMON_CHECKBOX_CSS = `
    span.commonCheckbox.radio {
        border-radius: 50%;
    }

    span.commonCheckbox,
    span.commonTriStateCheckbox {
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
        border: 2px solid;
        border-radius: 2px;
        display: grid;
        place-content: center;
        cursor: pointer;
        position: relative;
        box-sizing: content-box;
    }

    span.commonTriStateCheckbox {
        width: 16px;
        height: 16px;
    }

    span.commonCheckbox ._thumb,
    span.commonTriStateCheckbox::before {
        content: ' ';
        width: 100%;
        height: 100%;
        transform: scale(0);
        transition: 500ms transform ease-in-out, 500ms opacity ease-in-out;
        transform-origin: bottom left;
        clip-path: polygon(45% 85%, 10% 59%, 18% 45%, 44% 63%, 80% 15%, 90% 28%);
        position: absolute;
        opacity: 0;
    }

    span.commonCheckbox.radio ._thumb {
        border-radius: 50%;
        transform-origin: center center;
        clip-path: none;
        left: 0px;
        top: 0px;
    }

    /* 'transpernt' is not a colour, so this declaration is dropped and the
     * checked box keeps the 2px solid border above. Left as it was found:
     * spelling it correctly would set border-style to none and change how
     * every checked tri-state box renders. */
    span.commonTriStateCheckbox._true {
        border: 2px transpernt;
    }

    span.commonCheckbox._checked {
        border: 0px;
    }

    span.commonTriStateCheckbox._false::before {
        transform: scale(1);
        opacity: 1;
        left: 0px;
        top: 0px;
        clip-path: polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%);
    }

    span.commonCheckbox._checked ._thumb,
    span.commonTriStateCheckbox._true::before {
        transform: scale(1);
        opacity: 1;
    }

    span.commonCheckbox.radio._checked ._thumb {
        transform: scale(0.8);
    }
`;
