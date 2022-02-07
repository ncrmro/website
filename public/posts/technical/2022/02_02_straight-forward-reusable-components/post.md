---
slug: straight-forward-reusable-components
title: Straight forward reusable React components
date: "2022-02-02"
description:
  Building clean reusable components and avoiding decision paralysis when
  choosing props.
tags: ["React"]
---

## Background

I've become a big fan of not using too many libraries in my frontend
applications both because of performance concerns and often pre-made components
styles are very hard to override with small tweaks.

Now days

- typically just like writing straight simple CSS.
- Try not to write reusable components too early (premature
  optimization/abstractions) Reusable components should carry their own state

## Examples

### HR - [Horizontal Rule](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hr)

Let's take a `<hr/>` HTML tag for example. Rather than give any specific element
a bottom border we can instead use an `<hr/>` reusable component.

![Demonstrating the Mutation Updating the Apollo Cache](horizontal-rule-in-form.png)

Writing a reusable component can usually result in decision paralysis

- How do we handle all potential prop cases (further demonstrated in next
  component)
- If we want to override the color defined in the CSS we can pass those in as
  styles

By CMD clicking say the `div` tag we can see the prop types.

```typescript jsx
// HorizontalRule.tsx
import React from "react";
import styles from "./HorizontalRule.module.css";

type HorizontalRuleProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHRElement>,
  HTMLHRElement
>;

const HorizontalRule: React.FC<HorizontalRuleProps> = (props) => (
  <hr className={styles.root} {...props} />
);

export default HorizontalRule;
```

```css
/*HorizontalRule.module.css*/
.root {
  border-top: 1px solid var(--greyLight);
  width: 100%;
}
```

A couple of things to note,

- we define some basic CSS styles throughout the use of classname
- we spread the props after the initial classname
- this allows us to pass in a custom classname later or just a styles object

## Input

```typescript jsx
import React from "react";
import styles from "./Input.module.css";

interface Props
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "onChange"
  > {
  id: string;
  label?: string;
  onChange: (value: string) => void;
}

const Input: React.FC<Props> = ({ label, onChange, ...props }) => (
  <div className={styles.root}>
    {label && (
      <label htmlFor={props.id} className={styles.label}>
        {label}
      </label>
    )}
    <input
      className={styles.input}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  </div>
);

export default Input;
```

- overriding the onChange to automatically return the value rather than the
  element
- Now we can automatically pass props to input autocomplete, required, regex
  patterns, etc with having to manually define them again
- Even tho we havea custom onChange method we can still override to get the
  original element (although we might need two on change function type
  declerations)

## Dropdown selector

We can take this idea even further when implementing a dropdown selector in the
code below we can now pass any props to the root/label/select/options tags.

These types come from the react library typings themselves but are not exported.

```typescript jsx
import React from "react";
import styles from "./DropdownSelect.module.css";
export interface DropdownSelectProps {
  id: string;
  name: string;
  value: string;
  values: Array<[value: string, text: string]>;
  onChange: (value: string) => void;
  rootDivProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  labelProps?: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >;
  selectProps?: React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >;
  optionsProps?: React.DetailedHTMLProps<
    React.OptionHTMLAttributes<HTMLOptionElement>,
    HTMLOptionElement
  >;
}

const DropdownSelect: React.FC<DropdownSelectProps> = (props) => (
  <div className={styles.root} {...props.rootDivProps}>
    <label htmlFor={props.id} {...props.labelProps}>
      {props.name}
    </label>

    <select
      name={props.name}
      id={props.id}
      onChange={(e) => props.onChange(e.target.value)}
    >
      {props.values.map(([value, text]) => (
        <option key={value} value={value}>
          {text}
        </option>
      ))}
    </select>
  </div>
);

export default DropdownSelect;
```

## RadioButtons

```typescript jsx
import React from "react";
import styles from "./RadioButtons.module.css";

interface RadioButtonsProps {
  name: string;
  selectedValue: string;
  onSelect: (value: string) => void;
  options: Array<{ id?: string; value: string; text: string }>;
  rootDivProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
  labelProps?: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >;
  radioButtonProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
}

const RadioButtons: React.FC<RadioButtonsProps> = (props) => (
  <div className={styles.root} {...props.rootDivProps}>
    {props.options.map((option) => (
      <div key={option.value}>
        <input
          className={styles.input}
          {...props.radioButtonProps}
          value={option.value}
          checked={option.value === props.selectedValue}
          onChange={({ target: { value } }) => props.onSelect(value)}
          id={option.id ?? option.value}
          type="radio"
        />
        <label htmlFor={option.id ?? option.value} {...props.labelProps}>
          {option.text}
        </label>
      </div>
    ))}
  </div>
);

export default RadioButtons;
```

```css
.root {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
```
