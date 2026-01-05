# Comprehensive Component Reference

This document provides complete property definitions for all available UI components. Use this as the authoritative reference when generating component definitions.

## Property Value Format

All property values must use this structure:

```json
{
  "propertyName": { "value": "actual value" }
}
```

For data bindings:

```json
{
  "propertyName": { "location": "Page.someValue" }
}
```

---

## Pseudo-State Styling

**Not all components support all pseudo-states.** Each component explicitly declares which pseudo-states it supports. Use the suffix in `styleProperties` only for components that support that state.

**Available Pseudo-States:**

| Pseudo-State | Suffix      | Description                        |
| ------------ | ----------- | ---------------------------------- |
| Hover        | `:hover`    | When mouse hovers over the element |
| Focus        | `:focus`    | When element has keyboard focus    |
| Disabled     | `:disabled` | When element is disabled/read-only |
| Active       | `:active`   | When element is being pressed      |
| Visited      | `:visited`  | For links that have been visited   |
| ReadOnly     | `:readonly` | When element is in read-only mode  |

**Usage in styleProperties:**

```json
{
  "styleProperties": {
    "buttonStyle": {
      "resolutions": {
        "ALL": {
          "backgroundColor": { "value": "#007ACC" },
          "backgroundColor:hover": { "value": "#005A9E" },
          "opacity:disabled": { "value": "0.5" }
        }
      }
    }
  }
}
```

---

## Layout Components

### Grid

The primary container component for layouts. Uses flexbox or CSS grid.

**Type**: `Grid`

**Accepts Children**: Yes (unlimited)

**Allowed Child Types**: Any component

**Pseudo-states**: `hover`, `focus`, `readonly`

**Sub-components for styling**:

| Sub-component | Description             |
| ------------- | ----------------------- |
| `` (root)     | The main grid container |

**Properties**:

| Property          | Type    | Description              | Default              |
| ----------------- | ------- | ------------------------ | -------------------- |
| `layout`          | enum    | Layout mode              | `SINGLECOLUMNLAYOUT` |
| `onClick`         | string  | Event function key       | -                    |
| `linkPath`        | string  | Navigation path on click | -                    |
| `visibility`      | boolean | Show/hide component      | true                 |
| `readOnly`        | boolean | Read-only mode           | false                |
| `containerType`   | enum    | HTML semantic tag        | `DIV`                |
| `borderRadius`    | enum    | Border radius preset     | `_STRAIGHT`          |
| `border`          | enum    | Border width preset      | `_NONE`              |
| `boxShadow`       | enum    | Shadow preset            | `_NONE`              |
| `padding`         | enum    | Padding preset           | `_NONE`              |
| `background`      | string  | Background preset        | -                    |
| `stopPropagation` | boolean | Stop click propagation   | false                |
| `preventDefault`  | boolean | Prevent default click    | false                |

**Layout Values**:

- `ROWLAYOUT` - Horizontal flex row
- `SINGLECOLUMNLAYOUT` - Vertical column (default)
- `ROWCOLUMNLAYOUT` - Row on desktop, column on mobile
- `TWOCOLUMNSLAYOUT` - Two columns
- `THREECOLUMNSLAYOUT` - Three columns (two on tablet, one on mobile)

**Container Type Values** (for SEO):

- `DIV`, `ARTICLE`, `SECTION`, `ASIDE`, `FOOTER`, `HEADER`, `MAIN`, `NAV`

**Events**:

- `onClick` - Click handler
- `onMouseEnter` - Mouse enter
- `onMouseLeave` - Mouse leave
- `onEnteringViewport` - Element enters viewport
- `onLeavingViewport` - Element leaves viewport
- `onDropData` - Data dropped on element

**Example**:

```json
{
  "key": "header",
  "type": "Grid",
  "properties": {
    "layout": { "value": "ROWLAYOUT" },
    "containerType": { "value": "HEADER" }
  },
  "children": { "logo": true, "nav": true }
}
```

---

### SectionGrid

Grid with responsive sections for complex layouts.

**Type**: `SectionGrid`

**Accepts Children**: Yes (unlimited)

**Allowed Child Types**: Any component

**Pseudo-states**: `hover`, `focus`

**Sub-components for styling**:

| Sub-component | Description                     |
| ------------- | ------------------------------- |
| `` (root)     | The main section grid container |

---

## Form Input Components

### TextBox

Text input field for single-line text or numbers.

**Type**: `TextBox`

**Accepts Children**: No

**Pseudo-states**: `focus`, `disabled`

**Sub-components for styling**:

| Sub-component                | Description                                |
| ---------------------------- | ------------------------------------------ |
| `` (root)                    | The outer container                        |
| `inputBox`                   | The actual input element                   |
| `label`                      | The floating label                         |
| `leftIcon`                   | Left icon element                          |
| `rightIcon`                  | Right icon element                         |
| `supportText`                | Helper text below input                    |
| `errorText`                  | Validation error message                   |
| `errorTextContainer`         | Container for error messages               |
| `asterisk`                   | Mandatory asterisk                         |
| `editRequestIcon`            | Edit request icon (for \_editOnReq design) |
| `editConfirmIcon`            | Edit confirm icon                          |
| `editCancelIcon`             | Edit cancel icon                           |
| `editConfirmCancelContainer` | Container for edit buttons                 |

**Properties**:

| Property                 | Type    | Description                                 | Default     |
| ------------------------ | ------- | ------------------------------------------- | ----------- |
| `label`                  | string  | Field label                                 | -           |
| `placeholder`            | string  | Placeholder text                            | -           |
| `bindingPath`            | string  | Data binding path (e.g., `Page.form.email`) | -           |
| `defaultValue`           | any     | Default value                               | -           |
| `isPassword`             | boolean | Show as password field                      | false       |
| `valueType`              | enum    | `text` or `number`                          | `text`      |
| `numberType`             | enum    | `DECIMAL` or `INTEGER`                      | `DECIMAL`   |
| `validation`             | array   | Validation rules                            | -           |
| `readOnly`               | boolean | Read-only mode                              | false       |
| `visibility`             | boolean | Show/hide                                   | true        |
| `autoFocus`              | boolean | Auto-focus on load                          | false       |
| `autoComplete`           | enum    | Browser autocomplete                        | `off`       |
| `noFloat`                | boolean | Disable floating label                      | false       |
| `supportingText`         | string  | Helper text below input                     | -           |
| `leftIcon`               | string  | Left icon (FA class)                        | -           |
| `rightIcon`              | string  | Right icon (FA class)                       | -           |
| `maxChars`               | number  | Max characters allowed                      | -           |
| `showMandatoryAsterisk`  | boolean | Show \* for required                        | false       |
| `hideClearButton`        | boolean | Hide clear (X) button                       | false       |
| `designType`             | enum    | Visual style variant                        | -           |
| `colorScheme`            | string  | Color scheme                                | -           |
| `emptyValue`             | enum    | Value when empty                            | `UNDEFINED` |
| `removeKeyWhenEmpty`     | boolean | Delete key when empty                       | false       |
| `updateStoreImmediately` | boolean | Update on typing (vs blur)                  | false       |

**Design Types**:

- `_outlined` - Outlined style
- `_filled` - Filled style
- `_bigDesign1` - Large design
- `_editOnReq` - Edit on request

**Empty Value Types**:

- `UNDEFINED` - JavaScript undefined
- `NULL` - JavaScript null
- `ENMPTYSTRING` - Empty string ""
- `ZERO` - Number 0

**Events**:

- `onChange` - Value changed
- `onBlur` - Input lost focus
- `onFocus` - Input gained focus
- `onEnter` - Enter key pressed
- `onClear` - Clear button clicked
- `onLeftIconClick` - Left icon clicked
- `onRightIconClick` - Right icon clicked

**Example**:

```json
{
  "key": "emailInput",
  "type": "TextBox",
  "properties": {
    "label": { "value": "Email Address" },
    "placeholder": { "value": "Enter your email" },
    "bindingPath": { "value": "Page.form.email" },
    "validation": [
      { "type": "MANDATORY", "message": "Email is required" },
      { "type": "EMAIL", "message": "Invalid email format" }
    ]
  }
}
```

---

### TextArea

Multi-line text input.

**Type**: `TextArea`

**Accepts Children**: No

**Pseudo-states**: `focus`, `disabled`

**Sub-components for styling**: Same as TextBox

**Properties**: Similar to TextBox, plus:

| Property | Type   | Description            | Default |
| -------- | ------ | ---------------------- | ------- |
| `rows`   | number | Number of visible rows | -       |

---

### Dropdown

Selection dropdown/select component.

**Type**: `Dropdown`

**Accepts Children**: No

**Pseudo-states**: `hover`, `focus`, `disabled`

**Sub-components for styling**:

| Sub-component                | Description                    |
| ---------------------------- | ------------------------------ |
| `` (root)                    | The outer container            |
| `dropDownContainer`          | The dropdown options container |
| `dropdownItem`               | Individual dropdown option     |
| `dropdownItemLabel`          | Option label text              |
| `dropdownCheckIcon`          | Selected item check mark       |
| `leftIcon`                   | Left icon element              |
| `rightIcon`                  | Right icon (arrow)             |
| `inputBox`                   | The dropdown trigger/display   |
| `label`                      | The floating label             |
| `asterisk`                   | Mandatory asterisk             |
| `supportText`                | Helper text                    |
| `errorText`                  | Validation error message       |
| `errorTextContainer`         | Container for error messages   |
| `dropdownSearchBoxContainer` | Search box container           |
| `dropDownSearchIcon`         | Search icon                    |
| `dropdownSearchBox`          | Search input when searchable   |
| `checkbox`                   | Checkbox for multi-select      |
| `thumb`                      | Toggle thumb for selection     |
| `editRequestIcon`            | Edit request icon              |
| `editConfirmIcon`            | Edit confirm icon              |
| `editCancelIcon`             | Edit cancel icon               |
| `editConfirmCancelContainer` | Container for edit buttons     |

**Properties**:

| Property        | Type       | Description              | Default |
| --------------- | ---------- | ------------------------ | ------- |
| `label`         | string     | Field label              | -       |
| `bindingPath`   | string     | Data binding path        | -       |
| `data`          | array/path | Options data             | -       |
| `labelKey`      | string     | Key for option label     | -       |
| `uniqueKey`     | string     | Key for option unique ID | -       |
| `selectionKey`  | string     | Key for option value     | -       |
| `placeholder`   | string     | Placeholder text         | -       |
| `isSearchable`  | boolean    | Enable search            | false   |
| `isMultiSelect` | boolean    | Allow multiple selection | false   |
| `noFloat`       | boolean    | Disable floating label   | false   |
| `validation`    | array      | Validation rules         | -       |
| `designType`    | enum       | Visual style variant     | -       |
| `colorScheme`   | string     | Color scheme             | -       |

**Design Types**:

- `_outlined` - Outlined dropdown
- `_filled` - Filled dropdown
- `_bigDesign1` - Large design
- `_text` - Text dropdown
- `_editOnReq` - Edit on request

**Events**:

- `onClick` - Dropdown clicked
- `onSearch` - Search text changed (when searchable)
- `onScrollReachedEnd` - Scrolled to end of options

**Example**:

```json
{
  "key": "countryDropdown",
  "type": "Dropdown",
  "properties": {
    "label": { "value": "Country" },
    "bindingPath": { "value": "Page.form.country" },
    "data": { "location": "Page.countries" },
    "labelKey": { "value": "name" },
    "selectionKey": { "value": "code" }
  }
}
```

---

### CheckBox

Boolean checkbox input.

**Type**: `CheckBox`

**Accepts Children**: No

**Pseudo-states**: `hover`, `focus`, `disabled`

**Sub-components for styling**:

| Sub-component | Description          |
| ------------- | -------------------- |
| `` (root)     | The outer container  |
| `label`       | The label text       |
| `checkbox`    | The checkbox element |
| `thumb`       | The tick/check mark  |

**Properties**:

| Property       | Type    | Description           | Default |
| -------------- | ------- | --------------------- | ------- |
| `label`        | string  | Checkbox label        | -       |
| `bindingPath`  | string  | Data binding path     | -       |
| `defaultValue` | boolean | Default checked state | false   |

**Events**:

- `onChange` - Checked state changed

**Example**:

```json
{
  "key": "rememberMe",
  "type": "CheckBox",
  "properties": {
    "label": { "value": "Remember me" },
    "bindingPath": { "value": "Page.form.rememberMe" }
  }
}
```

---

### RadioButton

Single selection from a group.

**Type**: `RadioButton`

**Accepts Children**: No

**Pseudo-states**: `hover`, `focus`, `disabled`

**Sub-components for styling**:

| Sub-component | Description              |
| ------------- | ------------------------ |
| `` (root)     | The outer container      |
| `label`       | The label text           |
| `checkbox`    | The radio button element |
| `thumb`       | The selected indicator   |

**Properties**:

| Property      | Type   | Description         | Default |
| ------------- | ------ | ------------------- | ------- |
| `label`       | string | Option label        | -       |
| `bindingPath` | string | Data binding path   | -       |
| `optionValue` | any    | Value when selected | -       |
| `groupName`   | string | Radio group name    | -       |

---

### ToggleButton

On/off toggle switch.

**Type**: `ToggleButton`

**Accepts Children**: No

**Pseudo-states**: `hover`

**Sub-components for styling**:

| Sub-component | Description            |
| ------------- | ---------------------- |
| `` (root)     | The outer container    |
| `knob`        | The toggle knob/handle |
| `label`       | The label text         |
| `icon`        | Toggle icon            |

---

### Calendar

Date picker component.

**Type**: `Calendar`

**Accepts Children**: No

**Pseudo-states**: `hover`, `focus`, `disabled`

**Sub-components for styling**:

| Sub-component       | Description          |
| ------------------- | -------------------- |
| `` (root)           | The outer container  |
| `inputBox`          | The input display    |
| `calendarContainer` | The calendar popup   |
| `header`            | Calendar header      |
| `day`               | Individual day cells |
| `month`             | Month display        |
| `year`              | Year display         |
| `navigation`        | Navigation arrows    |

**Properties**:

| Property      | Type   | Description             | Default |
| ------------- | ------ | ----------------------- | ------- |
| `label`       | string | Field label             | -       |
| `bindingPath` | string | Data binding path       | -       |
| `dateFormat`  | string | Date format string      | -       |
| `minDate`     | string | Minimum selectable date | -       |
| `maxDate`     | string | Maximum selectable date | -       |

---

### FileUpload

File upload component.

**Type**: `FileUpload`

**Accepts Children**: No

**Pseudo-states**: `hover`, `disabled`

**Sub-components for styling**:

| Sub-component  | Description            |
| -------------- | ---------------------- |
| `` (root)      | The outer container    |
| `uploadButton` | The upload button      |
| `fileList`     | List of uploaded files |
| `fileItem`     | Individual file item   |
| `removeButton` | Remove file button     |

**Properties**:

| Property      | Type    | Description           | Default |
| ------------- | ------- | --------------------- | ------- |
| `label`       | string  | Field label           | -       |
| `bindingPath` | string  | Data binding path     | -       |
| `accept`      | string  | Accepted file types   | -       |
| `multiple`    | boolean | Allow multiple files  | false   |
| `maxSize`     | number  | Max file size (bytes) | -       |

---

### RangeSlider

Slider for numeric range selection.

**Type**: `RangeSlider`

**Accepts Children**: No

**Pseudo-states**: `hover`, `readOnly`

**Sub-components for styling**:

| Sub-component | Description             |
| ------------- | ----------------------- |
| `` (root)     | The outer container     |
| `track`       | The slider track        |
| `thumb`       | The slider thumb/handle |
| `valueLabel`  | Value display label     |

**Properties**:

| Property      | Type   | Description       | Default |
| ------------- | ------ | ----------------- | ------- |
| `bindingPath` | string | Data binding path | -       |
| `min`         | number | Minimum value     | 0       |
| `max`         | number | Maximum value     | 100     |
| `step`        | number | Step increment    | 1       |

---

## Display Components

### Text

Display text content (supports plain text and markdown).

**Type**: `Text`

**Accepts Children**: No

**Pseudo-states**: `hover`

**Sub-components for styling**:

| Sub-component             | Description                    |
| ------------------------- | ------------------------------ |
| `` (root)                 | The outer container            |
| `text`                    | The text element itself        |
| `markdownContainer`       | Container for markdown content |
| `h1` - `h6`               | Markdown heading elements      |
| `p`                       | Paragraph element              |
| `em`                      | Emphasis/italic text           |
| `b`                       | Bold text                      |
| `links`                   | Link elements                  |
| `linksHover`              | Link hover state               |
| `ol`, `ul`                | List containers                |
| `oli`, `ulli`             | List items                     |
| `codeBlock`               | Code block container           |
| `icBlock`                 | Inline code                    |
| `blockQuotes`             | Block quote container          |
| `table`, `th`, `tr`, `td` | Table elements                 |
| `images`                  | Image elements in markdown     |

**Properties**:

| Property        | Type    | Description               | Default        |
| --------------- | ------- | ------------------------- | -------------- |
| `text`          | string  | Text content to display   | -              |
| `textType`      | enum    | `TEXT` or `MD` (Markdown) | `TEXT`         |
| `textContainer` | enum    | HTML tag for SEO          | `SPAN`         |
| `textColor`     | enum    | Text color scheme         | `_primaryText` |
| `stringFormat`  | enum    | String formatting         | `STRING`       |
| `textLength`    | number  | Max text length           | -              |
| `visibility`    | boolean | Show/hide                 | true           |

**Text Container Values** (for SEO):

- `SPAN`, `H1`, `H2`, `H3`, `H4`, `H5`, `H6`, `I`, `P`, `B`, `PRE`

**Example**:

```json
{
  "key": "welcomeText",
  "type": "Text",
  "properties": {
    "text": { "value": "Welcome to our application!" }
  }
}
```

---

### Image

Display images.

**Type**: `Image`

**Accepts Children**: No

**Pseudo-states**: `hover`

**Sub-components for styling**:

| Sub-component  | Description              |
| -------------- | ------------------------ |
| `` (root)      | The outer container      |
| `image`        | The img element          |
| `zoomPreview`  | Zoom preview container   |
| `magnifier`    | Magnifier overlay        |
| `sliderHandle` | Comparison slider handle |
| `sliderLine`   | Comparison slider line   |
| `tooltip`      | Image tooltip            |

**Properties**:

| Property          | Type    | Description              | Default |
| ----------------- | ------- | ------------------------ | ------- |
| `src`             | string  | Image URL/path           | -       |
| `alt`             | string  | Alt text                 | -       |
| `src2`-`src5`     | string  | Responsive image sources | -       |
| `fallBackImg`     | string  | Fallback when main fails | -       |
| `imgLazyLoading`  | boolean | Enable lazy loading      | false   |
| `enhancementType` | enum    | Image enhancement        | `none`  |
| `onClick`         | string  | Click event function     | -       |

**Enhancement Types**: `none`, `zoomPreview`, `magnification`, `comparison`

**Example**:

```json
{
  "key": "logo",
  "type": "Image",
  "properties": {
    "src": { "value": "/images/logo.png" },
    "alt": { "value": "Company Logo" }
  }
}
```

---

### Icon

Display icons (Font Awesome, Material, etc.).

**Type**: `Icon`

**Accepts Children**: No

**Pseudo-states**: None

**Sub-components for styling**:

| Sub-component | Description      |
| ------------- | ---------------- |
| `` (root)     | The icon element |

**Properties**:

| Property  | Type   | Description                           | Default |
| --------- | ------ | ------------------------------------- | ------- |
| `icon`    | string | Icon class (e.g., `fa-solid fa-user`) | -       |
| `onClick` | string | Click event function                  | -       |

**Example**:

```json
{
  "key": "userIcon",
  "type": "Icon",
  "properties": {
    "icon": { "value": "fa-solid fa-user" }
  }
}
```

---

### Video

Video player component.

**Type**: `Video`

**Accepts Children**: No

**Pseudo-states**: None

**Sub-components for styling**:

| Sub-component | Description         |
| ------------- | ------------------- |
| `` (root)     | The video container |
| `video`       | The video element   |

**Properties**:

| Property   | Type    | Description      | Default |
| ---------- | ------- | ---------------- | ------- |
| `src`      | string  | Video URL        | -       |
| `poster`   | string  | Poster image URL | -       |
| `autoPlay` | boolean | Auto-play video  | false   |
| `controls` | boolean | Show controls    | true    |
| `loop`     | boolean | Loop video       | false   |
| `muted`    | boolean | Mute audio       | false   |

---

### ProgressBar

Progress indicator.

**Type**: `ProgressBar`

**Accepts Children**: No

**Pseudo-states**: `hover`

**Sub-components for styling**:

| Sub-component | Description         |
| ------------- | ------------------- |
| `` (root)     | The outer container |
| `track`       | The progress track  |
| `fill`        | The filled portion  |
| `label`       | Progress label      |

**Properties**:

| Property    | Type    | Description              | Default |
| ----------- | ------- | ------------------------ | ------- |
| `value`     | number  | Current progress (0-100) | 0       |
| `max`       | number  | Maximum value            | 100     |
| `showLabel` | boolean | Show percentage label    | false   |

---

### Chart

Data visualization charts.

**Type**: `Chart`

**Accepts Children**: No

**Pseudo-states**: None

**Properties**:

| Property    | Type       | Description   | Default |
| ----------- | ---------- | ------------- | ------- |
| `chartType` | enum       | Chart type    | `bar`   |
| `data`      | array/path | Chart data    | -       |
| `options`   | object     | Chart options | -       |

**Chart Types**: `bar`, `line`, `pie`, `doughnut`, `area`, etc.

---

## Interactive Components

### Button

Clickable button component.

**Type**: `Button`

**Accepts Children**: No

**Pseudo-states**: `focus`, `hover`, `disabled`

**Sub-components for styling**:

| Sub-component      | Description         |
| ------------------ | ------------------- |
| `` (root)          | The button element  |
| `leftIcon`         | Left icon element   |
| `rightIcon`        | Right icon element  |
| `leftImage`        | Left image element  |
| `activeLeftImage`  | Active left image   |
| `rightImage`       | Right image element |
| `activeRightImage` | Active right image  |

**Properties**:

| Property          | Type    | Description                 | Default |
| ----------------- | ------- | --------------------------- | ------- |
| `label`           | string  | Button text                 | -       |
| `onClick`         | string  | Click event function key    | -       |
| `linkPath`        | string  | Navigation path             | -       |
| `target`          | string  | Link target (\_blank, etc.) | -       |
| `leftIcon`        | string  | Left icon class             | -       |
| `rightIcon`       | string  | Right icon class            | -       |
| `leftImage`       | string  | Left image URL              | -       |
| `rightImage`      | string  | Right image URL             | -       |
| `designType`      | enum    | Visual style variant        | -       |
| `colorScheme`     | string  | Color scheme                | -       |
| `readOnly`        | boolean | Disabled state              | false   |
| `visibility`      | boolean | Show/hide                   | true    |
| `stopPropagation` | boolean | Stop click propagation      | false   |
| `preventDefault`  | boolean | Prevent default click       | false   |

**Design Types**:

- `_outlined` - Outlined button
- `_text` - Text-only button
- `_iconButton` - Icon button
- `_iconPrimaryButton` - Primary icon button
- `_fabButton` - Floating action button
- `_fabButtonMini` - Mini FAB
- `_decorative` - Decorative style
- `_bigDesign1` - Large design

**Example**:

```json
{
  "key": "submitBtn",
  "type": "Button",
  "properties": {
    "label": { "value": "Submit" },
    "onClick": { "value": "onSubmitForm" },
    "leftIcon": { "value": "fa-solid fa-paper-plane" }
  }
}
```

---

### Link

Hyperlink component.

**Type**: `Link`

**Accepts Children**: No

**Pseudo-states**: `hover`, `visited`

**Sub-components for styling**:

| Sub-component  | Description        |
| -------------- | ------------------ |
| `` (root)      | The link element   |
| `externalIcon` | External link icon |

**Properties**:

| Property   | Type   | Description     | Default |
| ---------- | ------ | --------------- | ------- |
| `text`     | string | Link text       | -       |
| `linkPath` | string | Navigation path | -       |
| `target`   | string | Link target     | -       |
| `onClick`  | string | Click event     | -       |

---

### Menu

Navigation menu component.

**Type**: `Menu`

**Accepts Children**: No

**Pseudo-states**: `hover`, `disabled`, `active`, `visited`

**Sub-components for styling**:

| Sub-component | Description           |
| ------------- | --------------------- |
| `` (root)     | The menu container    |
| `menuItem`    | Individual menu items |
| `submenu`     | Submenu container     |
| `icon`        | Menu item icons       |

**Properties**:

| Property      | Type       | Description                | Default      |
| ------------- | ---------- | -------------------------- | ------------ |
| `menuData`    | array/path | Menu items data            | -            |
| `orientation` | enum       | `horizontal` or `vertical` | `horizontal` |

---

### Popup

Modal/dialog component.

**Type**: `Popup`

**Accepts Children**: Yes (unlimited)

**Allowed Child Types**: Any component

**Pseudo-states**: None

**Sub-components for styling**:

| Sub-component          | Description            |
| ---------------------- | ---------------------- |
| `` (root)              | The backdrop/overlay   |
| `modal`                | The modal container    |
| `titleGrid`            | Title bar container    |
| `modalTitle`           | Title text             |
| `closeButton`          | Close button icon      |
| `closeButtonContainer` | Close button container |

**Properties**:

| Property              | Type    | Description             | Default          |
| --------------------- | ------- | ----------------------- | ---------------- |
| `showClose`           | boolean | Show close button       | true             |
| `closeOnEscape`       | boolean | Close on ESC key        | true             |
| `closeOnOutsideClick` | boolean | Close on backdrop click | true             |
| `modelTitle`          | string  | Popup title             | -                |
| `modalPosition`       | enum    | Position on screen      | `_center_center` |
| `designType`          | enum    | Design variant          | `_design1`       |

**Modal Position Values**:

- `_left_top`, `_center_top`, `_right_top`
- `_left_center`, `_center_center`, `_right_center`
- `_left_bottom`, `_center_bottom`, `_right_bottom`

**Events**:

- `eventOnOpen` - Triggered when popup opens
- `eventOnClose` - Triggered when popup closes

---

### Popover

Tooltip/popover component.

**Type**: `Popover`

**Accepts Children**: Yes (1 child - the trigger)

**Pseudo-states**: None

**Sub-components for styling**:

| Sub-component | Description           |
| ------------- | --------------------- |
| `` (root)     | The popover container |
| `content`     | Popover content area  |
| `arrow`       | Popover arrow         |

**Properties**:

| Property   | Type | Description                      | Default |
| ---------- | ---- | -------------------------------- | ------- |
| `trigger`  | enum | `hover` or `click`               | `hover` |
| `position` | enum | `top`, `bottom`, `left`, `right` | `top`   |

---

### Tabs

Tabbed content container.

**Type**: `Tabs`

**Accepts Children**: Yes (one child per tab)

**Allowed Child Types**: Any component

**Pseudo-states**: `hover`

**Sub-components for styling**:

| Sub-component    | Description                 |
| ---------------- | --------------------------- |
| `` (root)        | The outer container         |
| `tabsContainer`  | Container for tab buttons   |
| `tab`            | Individual tab button       |
| `tabHighlighter` | Active tab indicator        |
| `childContainer` | Content area for active tab |
| `icon`           | Tab icons                   |
| `tabsSeperator`  | Separator between tabs      |

**Properties**:

| Property          | Type    | Description                  | Default       |
| ----------------- | ------- | ---------------------------- | ------------- |
| `tabs`            | array   | Tab names list               | []            |
| `defaultActive`   | string  | Initially active tab         | -             |
| `icon`            | array   | Tab icons list               | []            |
| `showLabel`       | boolean | Show tab labels              | true          |
| `tabsOrientation` | enum    | `_horizontal` or `_vertical` | `_horizontal` |
| `tabsPosition`    | enum    | Tab alignment                | `_start`      |
| `designType`      | enum    | Visual style                 | -             |

**Tab Position Values**:

- `_start`, `_center`, `_end`, `_spaceAround`, `_spaceBetween`, `_spaceEvenly`

**Events**:

- `onTabChange` - Triggered when active tab changes

---

### Carousel

Image/content carousel.

**Type**: `Carousel`

**Accepts Children**: Yes (unlimited slides)

**Allowed Child Types**: Any component

**Pseudo-states**: None

**Sub-components for styling**:

| Sub-component           | Description                    |
| ----------------------- | ------------------------------ |
| `` (root)               | The outer container            |
| `arrowButtonsContainer` | Container for arrow buttons    |
| `arrowButtons`          | Navigation arrow buttons       |
| `slideButtonsContainer` | Container for slide buttons    |
| `indicatorContainer`    | Container for slide indicators |
| `indicatorButton`       | Individual indicator button    |
| `indicatorButtonActive` | Active indicator button        |
| `indicatorNavBtn`       | Indicator navigation arrow     |
| `indicatorNavBtnActive` | Active indicator nav arrow     |

**Properties**:

| Property     | Type    | Description             | Default |
| ------------ | ------- | ----------------------- | ------- |
| `autoPlay`   | boolean | Auto-advance slides     | false   |
| `interval`   | number  | Auto-play interval (ms) | 5000    |
| `showDots`   | boolean | Show navigation dots    | true    |
| `showArrows` | boolean | Show prev/next arrows   | true    |

---

## Data Components

### ArrayRepeater

Repeats child components for each item in an array.

**Type**: `ArrayRepeater`

**Accepts Children**: Yes (1 template child)

**Allowed Child Types**: Any component (used as template)

**Pseudo-states**: None

**Sub-components for styling**:

| Sub-component        | Description                |
| -------------------- | -------------------------- |
| `` (root)            | The outer container        |
| `repeaterProperties` | Each repeater container    |
| `repeatedComp`       | Repeated component wrapper |
| `iconGrid`           | Icon container for actions |
| `add`                | Add button icon            |
| `remove`             | Remove button icon         |
| `move`               | Move button icons          |

**Properties**:

| Property          | Type    | Description                | Default              |
| ----------------- | ------- | -------------------------- | -------------------- |
| `bindingPath`     | string  | Path to array data         | -                    |
| `layout`          | enum    | Layout mode                | `SINGLECOLUMNLAYOUT` |
| `showAdd`         | boolean | Show add button            | false                |
| `showDelete`      | boolean | Show delete button         | false                |
| `showMove`        | boolean | Show move buttons          | false                |
| `isItemDraggable` | boolean | Enable drag reorder        | false                |
| `dataType`        | enum    | `array` or `object`        | `array`              |
| `defaultData`     | any     | Default data for new items | -                    |
| `filterCondition` | string  | Filter expression          | -                    |

**Events**:

- `addEvent` - Item added
- `removeEvent` - Item removed
- `moveEvent` - Item moved
- `onDropData` - Data dropped

**Example**:

```json
{
  "key": "userList",
  "type": "ArrayRepeater",
  "properties": {
    "bindingPath": { "value": "Store.users" }
  },
  "children": { "userCard": true }
}
```

---

### Form

Form container with validation support.

**Type**: `Form`

**Accepts Children**: Yes (unlimited form fields)

**Allowed Child Types**: Any component

**Pseudo-states**: None

**Properties**:

| Property          | Type   | Description                | Default |
| ----------------- | ------ | -------------------------- | ------- |
| `validationCheck` | string | Validation check reference | -       |
| `onSubmit`        | string | Submit event function      | -       |

---

### Table

Data table component.

**Type**: `Table`

**Accepts Children**: Yes (TableColumns)

**Allowed Child Types**: TableColumns, TableColumn, TableDynamicColumn

**Pseudo-states**: `hover`

**Properties**:

| Property     | Type       | Description          | Default |
| ------------ | ---------- | -------------------- | ------- |
| `data`       | array/path | Table data           | -       |
| `columns`    | array      | Column definitions   | -       |
| `pagination` | boolean    | Enable pagination    | false   |
| `sortable`   | boolean    | Enable sorting       | false   |
| `selectable` | boolean    | Enable row selection | false   |

---

## Animation Components

### Animator

Wrapper component for animations.

**Type**: `Animator`

**Accepts Children**: Yes (1 child to animate)

**Allowed Child Types**: Any component

**Pseudo-states**: None

**Properties**:

| Property            | Type    | Description             | Default |
| ------------------- | ------- | ----------------------- | ------- |
| `animationType`     | enum    | Animation type          | -       |
| `duration`          | number  | Animation duration (ms) | 300     |
| `delay`             | number  | Animation delay (ms)    | 0       |
| `triggerOnViewport` | boolean | Trigger when visible    | false   |

**Animation Types**: `fadeIn`, `fadeOut`, `slideIn`, `slideOut`, `zoomIn`, `zoomOut`, etc.

---

## Additional Components

### Audio

Audio player component with controls.

**Type**: `Audio`

**Accepts Children**: No

**Pseudo-states**: None

**Sub-components for styling**:

| Sub-component       | Description             |
| ------------------- | ----------------------- |
| `` (root)           | The audio container     |
| `playIcon`          | Play button icon        |
| `pauseIcon`         | Pause button icon       |
| `forwardIcon`       | Forward skip icon       |
| `rewindIcon`        | Rewind icon             |
| `volumeIcon`        | Volume icon             |
| `progressBar`       | Progress/seek bar       |
| `timeText`          | Time display text       |
| `playBackSpeedGrid` | Playback speed selector |

**Properties**:

| Property                   | Type    | Description            | Default |
| -------------------------- | ------- | ---------------------- | ------- |
| `src`                      | string  | Audio file URL         | -       |
| `autoPlay`                 | boolean | Auto-play audio        | false   |
| `loop`                     | boolean | Loop audio             | false   |
| `muted`                    | boolean | Start muted            | false   |
| `showPlayPause`            | boolean | Show play/pause button | true    |
| `showRewindAndFastForward` | boolean | Show skip buttons      | false   |
| `designType`               | enum    | Visual style variant   | -       |
| `colorScheme`              | string  | Color scheme           | -       |

---

### ButtonBar

Button group/toolbar for grouped actions.

**Type**: `ButtonBar`

**Accepts Children**: No

**Pseudo-states**: `hover`, `disabled`, `active`

**Sub-components for styling**:

| Sub-component | Description        |
| ------------- | ------------------ |
| `` (root)     | The container      |
| `button`      | Individual buttons |

**Properties**:

| Property          | Type       | Description            | Default |
| ----------------- | ---------- | ---------------------- | ------- |
| `data`            | array/path | Button items data      | -       |
| `bindingPath`     | string     | Selected value binding | -       |
| `buttonBarDesign` | enum       | Visual style           | -       |
| `colorScheme`     | string     | Color scheme           | -       |

**Events**:

- `onClick` - Button clicked

---

### ColorPicker

Color selection input component.

**Type**: `ColorPicker`

**Accepts Children**: No

**Pseudo-states**: `hover`, `disabled`, `focus`

**Sub-components for styling**:

| Sub-component       | Description           |
| ------------------- | --------------------- |
| `` (root)           | The outer container   |
| `dropDownContainer` | Color picker dropdown |
| `leftIcon`          | Left icon             |
| `rightIcon`         | Right icon            |
| `inputBox`          | Input display         |
| `label`             | Field label           |

**Properties**:

| Property       | Type   | Description         | Default |
| -------------- | ------ | ------------------- | ------- |
| `label`        | string | Field label         | -       |
| `bindingPath`  | string | Color value binding | -       |
| `defaultValue` | string | Default color       | -       |
| `designType`   | enum   | Visual style        | -       |
| `colorScheme`  | string | Color scheme        | -       |

---

### Gallery

Lightbox/gallery component for image viewing.

**Type**: `Gallery`

**Accepts Children**: Yes (unlimited images)

**Allowed Child Types**: Any component

**Pseudo-states**: None

**Sub-components for styling**:

| Sub-component           | Description             |
| ----------------------- | ----------------------- |
| `` (root)               | The gallery container   |
| `slideImage`            | Current slide image     |
| `arrowButtonsContainer` | Arrow buttons container |
| `arrowButtons`          | Navigation arrows       |
| `thumbnailContainer`    | Thumbnail strip         |
| `thumbnail`             | Individual thumbnails   |
| `toolbarLeftColumn`     | Left toolbar area       |
| `toolbarRightColumn`    | Right toolbar area      |

**Properties**:

| Property              | Type    | Description               | Default |
| --------------------- | ------- | ------------------------- | ------- |
| `bindingPath`         | string  | Toggle visibility binding | -       |
| `showArrowButtons`    | boolean | Show navigation arrows    | true    |
| `showThumbnails`      | boolean | Show thumbnail strip      | true    |
| `zoom`                | boolean | Enable zoom               | false   |
| `closeOnOutsideClick` | boolean | Close on backdrop click   | true    |

---

### Iframe

Embedded iframe component.

**Type**: `Iframe`

**Accepts Children**: No

**Pseudo-states**: None

**Sub-components for styling**:

| Sub-component | Description          |
| ------------- | -------------------- |
| `` (root)     | The iframe container |
| `iframe`      | The iframe element   |

**Properties**:

| Property          | Type    | Description          | Default |
| ----------------- | ------- | -------------------- | ------- |
| `src`             | string  | Iframe URL           | -       |
| `srcdoc`          | string  | Inline HTML content  | -       |
| `width`           | string  | Iframe width         | -       |
| `height`          | string  | Iframe height        | -       |
| `name`            | string  | Iframe name          | -       |
| `loading`         | enum    | Loading strategy     | `lazy`  |
| `sandbox`         | string  | Sandbox restrictions | -       |
| `allow`           | string  | Feature permissions  | -       |
| `allowfullscreen` | boolean | Allow fullscreen     | false   |

---

### ImageWithBrowser

Image component with file browser integration.

**Type**: `ImageWithBrowser`

**Accepts Children**: No

**Pseudo-states**: `hover`

**Sub-components for styling**:

| Sub-component | Description         |
| ------------- | ------------------- |
| `` (root)     | The outer container |
| `image`       | The image element   |

**Properties**:

| Property      | Type   | Description         | Default |
| ------------- | ------ | ------------------- | ------- |
| `src`         | string | Image URL/path      | -       |
| `alt`         | string | Alt text            | -       |
| `bindingPath` | string | Source path binding | -       |
| `fallBackImg` | string | Fallback image      | -       |

---

### MarkdownTOC

Table of contents generator for markdown content.

**Type**: `MarkdownTOC`

**Accepts Children**: No

**Pseudo-states**: `hover`, `visited`

**Sub-components for styling**:

| Sub-component     | Description          |
| ----------------- | -------------------- |
| `` (root)         | The TOC container    |
| `titleText`       | TOC title            |
| `H1` - `H6`       | Heading level links  |
| `collapsibleIcon` | Collapse/expand icon |

**Properties**:

| Property       | Type    | Description                | Default |
| -------------- | ------- | -------------------------- | ------- |
| `markdownText` | string  | Source markdown or binding | -       |
| `title`        | string  | TOC title                  | -       |
| `maxLevel`     | number  | Maximum heading level      | 6       |
| `collapsible`  | boolean | Enable collapse            | false   |

---

### Otp

OTP/PIN code input component.

**Type**: `Otp`

**Accepts Children**: No

**Pseudo-states**: `focus`, `disabled`

**Sub-components for styling**:

| Sub-component | Description            |
| ------------- | ---------------------- |
| `` (root)     | The outer container    |
| `inputBox`    | Individual input boxes |
| `label`       | Field label            |
| `errorText`   | Error message          |

**Properties**:

| Property      | Type    | Description       | Default |
| ------------- | ------- | ----------------- | ------- |
| `label`       | string  | Field label       | -       |
| `bindingPath` | string  | OTP value binding | -       |
| `otpLength`   | number  | Number of digits  | 4       |
| `isPassword`  | boolean | Mask input        | false   |
| `validation`  | array   | Validation rules  | -       |
| `designType`  | enum    | Visual style      | -       |
| `colorScheme` | string  | Color scheme      | -       |

**Events**:

- `onChange` - Value changed
- `onComplete` - All digits entered

---

### PhoneNumber

International phone number input with country code.

**Type**: `PhoneNumber`

**Accepts Children**: No

**Pseudo-states**: `focus`, `disabled`

**Sub-components for styling**:

| Sub-component        | Description              |
| -------------------- | ------------------------ |
| `` (root)            | The outer container      |
| `dropdownSelect`     | Country dropdown trigger |
| `selectedOption`     | Selected country display |
| `arrowIcon`          | Dropdown arrow           |
| `dropdownBody`       | Dropdown container       |
| `searchBoxContainer` | Search container         |
| `searchIcon`         | Search icon              |
| `searchBox`          | Search input             |
| `dropdownOptionList` | Options list             |
| `inputBox`           | Phone number input       |
| `label`              | Field label              |

**Properties**:

| Property             | Type   | Description          | Default |
| -------------------- | ------ | -------------------- | ------- |
| `label`              | string | Field label          | -       |
| `bindingPath`        | string | Phone number binding | -       |
| `bindingPath2`       | string | Country code binding | -       |
| `bindingPath3`       | string | Dial code binding    | -       |
| `defaultCountryCode` | string | Default country      | -       |
| `validation`         | array  | Validation rules     | -       |
| `designType`         | enum   | Visual style         | -       |
| `colorScheme`        | string | Color scheme         | -       |

---

### SchemaForm

Dynamic form generated from JSON Schema.

**Type**: `SchemaForm`

**Accepts Children**: No

**Pseudo-states**: None

**Sub-components for styling**:

| Sub-component | Description        |
| ------------- | ------------------ |
| `` (root)     | The form container |

**Properties**:

| Property      | Type        | Description            | Default |
| ------------- | ----------- | ---------------------- | ------- |
| `bindingPath` | string      | Schema value binding   | -       |
| `schema`      | object/path | JSON Schema definition | -       |

---

### SmallCarousel

Compact carousel for scrolling through items.

**Type**: `Small Carousel`

**Accepts Children**: Yes (unlimited)

**Allowed Child Types**: Any component

**Pseudo-states**: None

**Sub-components for styling**:

| Sub-component     | Description            |
| ----------------- | ---------------------- |
| `` (root)         | The carousel container |
| `slidesContainer` | Slides wrapper         |
| `prevButton`      | Previous button        |
| `nextButton`      | Next button            |

**Properties**:

| Property     | Type       | Description                  | Default       |
| ------------ | ---------- | ---------------------------- | ------------- |
| `data`       | array/path | Data for repeating children  | -             |
| `noOfChilds` | number     | Visible items count          | -1 (auto)     |
| `designType` | enum       | `_horizontal` or `_vertical` | `_horizontal` |
| `showArrows` | boolean    | Show navigation arrows       | true          |

---

### Stepper

Step wizard/progress indicator.

**Type**: `Stepper`

**Accepts Children**: No

**Pseudo-states**: `hover`

**Sub-components for styling**:

| Sub-component         | Description              |
| --------------------- | ------------------------ |
| `` (root)             | The stepper container    |
| `listItem`            | Step item                |
| `doneListItem`        | Completed step           |
| `activeListItem`      | Current active step      |
| `itemContainer`       | Step content container   |
| `doneItemContainer`   | Completed step container |
| `activeItemContainer` | Active step container    |

**Properties**:

| Property      | Type   | Description                | Default      |
| ------------- | ------ | -------------------------- | ------------ |
| `titles`      | array  | Step titles                | -            |
| `bindingPath` | string | Current step binding       | -            |
| `orientation` | enum   | `horizontal` or `vertical` | `horizontal` |

**Events**:

- `onStepChange` - Step changed

---

### Tags

Tag input/display component.

**Type**: `Tags`

**Accepts Children**: No

**Pseudo-states**: `hover`, `disabled`

**Sub-components for styling**:

| Sub-component                | Description          |
| ---------------------------- | -------------------- |
| `` (root)                    | The outer container  |
| `outerContainerWithInputBox` | Container with input |
| `inputBox`                   | Tag input            |
| `tagsContainer`              | Tags display area    |
| `eachTag`                    | Individual tag       |
| `tagCloseIcon`               | Tag remove icon      |

**Properties**:

| Property          | Type    | Description          | Default |
| ----------------- | ------- | -------------------- | ------- |
| `bindingPath`     | string  | Tags array binding   | -       |
| `placeholder`     | string  | Input placeholder    | -       |
| `allowDuplicates` | boolean | Allow duplicate tags | false   |
| `maxTags`         | number  | Maximum tags allowed | -       |
| `readOnly`        | boolean | Read-only mode       | false   |

**Events**:

- `onTagAdd` - Tag added
- `onTagRemove` - Tag removed

---

### TextList

Ordered or unordered list display.

**Type**: `TextList`

**Accepts Children**: No

**Pseudo-states**: `hover`

**Sub-components for styling**:

| Sub-component  | Description          |
| -------------- | -------------------- |
| `` (root)      | The list container   |
| `listItem`     | Individual list item |
| `listItemIcon` | Item bullet/icon     |

**Properties**:

| Property   | Type   | Description              | Default     |
| ---------- | ------ | ------------------------ | ----------- |
| `text`     | string | Comma-separated items    | -           |
| `listType` | enum   | `ordered` or `unordered` | `unordered` |
| `icon`     | string | Custom icon class        | -           |

---

### Timer

Countdown or stopwatch component.

**Type**: `Timer`

**Accepts Children**: No

**Pseudo-states**: None

**Sub-components for styling**:

| Sub-component | Description         |
| ------------- | ------------------- |
| `` (root)     | The timer container |

**Properties**:

| Property      | Type    | Description                | Default     |
| ------------- | ------- | -------------------------- | ----------- |
| `timerType`   | enum    | `countdown` or `stopwatch` | `countdown` |
| `duration`    | number  | Duration in seconds        | -           |
| `autoStart`   | boolean | Start automatically        | false       |
| `bindingPath` | string  | Timer value binding        | -           |

**Events**:

- `onComplete` - Timer finished
- `onTick` - Each tick

---

## Common Properties

These properties are available on most components:

| Property      | Type    | Description              |
| ------------- | ------- | ------------------------ |
| `visibility`  | boolean | Show/hide component      |
| `readOnly`    | boolean | Disable interactions     |
| `onClick`     | string  | Click event function key |
| `linkPath`    | string  | Navigation path on click |
| `designType`  | enum    | Visual style variant     |
| `colorScheme` | string  | Color scheme name        |

---

## Style Properties

All components support these style property groups in `styleProperties`:

- **layout** - Display, flexbox, grid properties
- **position** - Position, z-index
- **spacing** - Margin, padding
- **typography** - Font, text properties
- **border** - Border style, radius
- **size** - Width, height
- **effects** - Box shadow, opacity, transforms
- **background** - Background color, image, gradient

**Style Structure**:

```json
{
  "styleProperties": {
    "uniqueStyleId": {
      "resolutions": {
        "ALL": {
          "backgroundColor": { "value": "#ffffff" },
          "padding": { "value": "16px" },
          "color:hover": { "value": "#0066cc" }
        },
        "MOBILE_POTRAIT_SCREEN": {
          "padding": { "value": "8px" }
        }
      }
    }
  }
}
```

**Resolution Breakpoints**:

- `ALL` - All screen sizes (base)
- `MOBILE_POTRAIT_SCREEN` - 320px+
- `MOBILE_LANDSCAPE_SCREEN` - 480px+
- `TABLET_POTRAIT_SCREEN` - 768px+
- `TABLET_LANDSCAPE_SCREEN` - 1024px+
- `DESKTOP_SCREEN` - 1280px+
- `WIDE_SCREEN` - 1920px+

---

## Validation Types

For form components:

| Type         | Description              |
| ------------ | ------------------------ |
| `MANDATORY`  | Field is required        |
| `EMAIL`      | Valid email format       |
| `URL`        | Valid URL format         |
| `PHONE`      | Valid phone number       |
| `REGEX`      | Custom regex pattern     |
| `MIN_LENGTH` | Minimum character length |
| `MAX_LENGTH` | Maximum character length |
| `MIN`        | Minimum numeric value    |
| `MAX`        | Maximum numeric value    |

**Validation Example**:

```json
{
  "validation": [
    { "type": "MANDATORY", "message": "This field is required" },
    { "type": "MIN_LENGTH", "value": 8, "message": "Minimum 8 characters" }
  ]
}
```

---

## Component Summary Table

| Component        | Type               | Children     | Pseudo-states                    | Key Sub-components                                |
| ---------------- | ------------------ | ------------ | -------------------------------- | ------------------------------------------------- |
| Grid             | `Grid`             | Unlimited    | hover, focus, readonly           | -                                                 |
| SectionGrid      | `SectionGrid`      | Unlimited    | hover, focus                     | -                                                 |
| TextBox          | `TextBox`          | No           | focus, disabled                  | inputBox, label, errorText                        |
| TextArea         | `TextArea`         | No           | focus, disabled                  | inputBox, label, errorText                        |
| Dropdown         | `Dropdown`         | No           | hover, focus, disabled           | inputBox, dropDownContainer, dropdownItem         |
| CheckBox         | `CheckBox`         | No           | hover, focus, disabled           | checkbox, label, thumb                            |
| RadioButton      | `RadioButton`      | No           | hover, focus, disabled           | checkbox, label, thumb                            |
| ToggleButton     | `ToggleButton`     | No           | hover                            | knob, label, icon                                 |
| Calendar         | `Calendar`         | No           | hover, focus, disabled           | inputBox, calendarContainer                       |
| FileUpload       | `FileUpload`       | No           | hover, disabled                  | uploadButton, fileList                            |
| RangeSlider      | `RangeSlider`      | No           | hover, readOnly                  | track, thumb                                      |
| Text             | `Text`             | No           | hover                            | text, markdownContainer                           |
| Image            | `Image`            | No           | hover                            | image, zoomPreview, tooltip                       |
| Icon             | `Icon`             | No           | None                             | -                                                 |
| Video            | `Video`            | No           | None                             | video                                             |
| ProgressBar      | `ProgressBar`      | No           | hover                            | track, fill                                       |
| Chart            | `Chart`            | No           | None                             | -                                                 |
| Button           | `Button`           | No           | focus, hover, disabled           | leftIcon, rightIcon, leftImage, rightImage        |
| Link             | `Link`             | No           | hover, visited                   | externalIcon                                      |
| Menu             | `Menu`             | No           | hover, disabled, active, visited | menuItem, submenu                                 |
| Popup            | `Popup`            | Unlimited    | None                             | modal, titleGrid, closeButton                     |
| Popover          | `Popover`          | 1 (trigger)  | None                             | content, arrow                                    |
| Tabs             | `Tabs`             | Per tab      | hover                            | tabsContainer, tab, childContainer                |
| Carousel         | `Carousel`         | Unlimited    | None                             | arrowButtons, indicatorContainer, indicatorButton |
| ArrayRepeater    | `ArrayRepeater`    | 1 (template) | None                             | repeatedComp, add, remove                         |
| Form             | `Form`             | Unlimited    | None                             | -                                                 |
| Table            | `Table`            | Columns only | hover                            | -                                                 |
| Animator         | `Animator`         | 1            | None                             | -                                                 |
| Audio            | `Audio`            | No           | None                             | playIcon, pauseIcon, progressBar                  |
| ButtonBar        | `ButtonBar`        | No           | hover, disabled, active          | button                                            |
| ColorPicker      | `ColorPicker`      | No           | hover, disabled, focus           | dropDownContainer, inputBox, label                |
| Gallery          | `Gallery`          | Unlimited    | None                             | slideImage, arrowButtons, thumbnail               |
| Iframe           | `Iframe`           | No           | None                             | iframe                                            |
| ImageWithBrowser | `ImageWithBrowser` | No           | hover                            | image                                             |
| MarkdownTOC      | `MarkdownTOC`      | No           | hover, visited                   | titleText, H1-H6                                  |
| Otp              | `Otp`              | No           | focus, disabled                  | inputBox, label, errorText                        |
| PhoneNumber      | `PhoneNumber`      | No           | focus, disabled                  | dropdownSelect, inputBox, label                   |
| SchemaForm       | `SchemaForm`       | No           | None                             | -                                                 |
| SmallCarousel    | `Small Carousel`   | Unlimited    | None                             | slidesContainer, prevButton, nextButton           |
| Stepper          | `Stepper`          | No           | hover                            | listItem, doneListItem, activeListItem            |
| Tags             | `Tags`             | No           | hover, disabled                  | inputBox, tagsContainer, eachTag                  |
| TextList         | `TextList`         | No           | hover                            | listItem, listItemIcon                            |
| Timer            | `Timer`            | No           | None                             | -                                                 |
