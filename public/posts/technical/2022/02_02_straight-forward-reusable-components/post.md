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
  optimization/abstractions)

## Examples

### HR - [Horizontal Rule](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hr)

Let's take a `<hr/>` HTML tag for example. Rather than give any specific element
a bottom border we can instead use an `<hr/>` reusable component.

![Demonstrating the Mutation Updating the Apollo Cache](mutation_example.gif)

Writing a reusable component can usually result in decision paralysis

- How do we handle all potential prop cases (further demonstrated in next
  component)
- If we want to override the color defined in the CSS we can pass those in as
  styles

Lastly, I don't think reusable components should carry state

```typescript jsx
// HorizontalRule.tsx
import React, { CSSProperties } from "react";
import styles from "./HorizontalRule.module.css";

interface HorizontalRule {
  style?: CSSProperties;
}

const HorizontalRule: React.FC<HorizontalRule> = (props) => (
  <hr style={props.style} className={styles.root} />
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

- we define some basic CSS
- we then pass a style prop that has type `CSS properties`
  - This allows us to override any style value if need be

## Input

For the input, I'm a big fan over

- overriding the onChange to automatically return the value rather than the
  element
- We can set autocomplete, required, regex patterns, etc

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
      {...props}
      className={styles.input}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default Input;
```

## Dropdown selector

We can take this idea even further when implementing a dropdown selector in the
code below we can now pass any props to the root/label/select/options tags.

These types come from the react library typings themselves but are not exported.

By CMD clicking say the `div` tag we can see the prop types.

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
