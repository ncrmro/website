import { TextAreaField } from "@/components/InputFields";
import React from "react";

export default function JournalEntryForm(props: {
  // entry: { id: string; body: string; } | null;
  entry: any;
  formAction: any;
}) {
  // const [state, setState] = React.useState(
  //   props.entry || {
  //     body: "",
  //   }
  // );

  return (
    // @ts-ignore
    <form action={props.formAction} className="w-full">
      <input type="hidden" name="id" value={props.entry?.id} />

      <TextAreaField
        id="body"
        label="Today"
        rows={15}
        defaultValue={props.entry?.body || ""}
        // onChange={(e) => setState({ ...state, body: e.target.value })}
      />
      <div className="flex justify-end mt-4">
        <button 
          type="submit" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
