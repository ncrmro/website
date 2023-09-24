import React from "react";

export const InputFieldStyles = {
  label: Object.values({
    base: "block text-sm font-medium leading-6 text-gray-900 ",
    dark: "dark:text-white",
  }).join(" "),
  input: Object.values({
    base: "block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",
    light:
      "text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600",
    dark: "dark:text-white dark:bg-white/5",
  }).join(" "),
};

interface InputFieldProps {
  type?: "text" | "date";
  id: string;
  label: string;
  title?: string;
  pattern?: string;
  value?: string;
  onChange: any;
}

export function InputField({ label, ...props }: InputFieldProps) {
  return (
    <>
      <label htmlFor={props.id} className={InputFieldStyles.label}>
        {label}
      </label>
      <input
        type={props.type}
        className={InputFieldStyles.input}
        id={props.id}
        name={props.id}
        title={props.title}
        pattern={props.pattern}
        value={props.value}
        onChange={props.onChange}
      />
    </>
  );
}

interface TextAreaProps {
  id: string;
  label: string;
  title?: string;
  pattern?: string;
  placeholder: string;
  rows?: number;
  value?: string;
  onChange: any;
}

export function TextAreaField({ label, ...props }: TextAreaProps) {
  return (
    <>
      <label htmlFor={props.id} className={InputFieldStyles.label}>
        {label}
      </label>
      <textarea {...props} className={InputFieldStyles.input} />
    </>
  );
}