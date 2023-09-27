import { TextAreaField } from "@/components/InputFields";
import React from "react";

export default function JournalEntryForm(props: {
  entry?: { id: string; body: string; created_date_str: string } | null;
  formAction: any;
}) {
  // const [state, setState] = React.useState(
  //   props.entry || {
  //     body: "",
  //   }
  // );

  return (
    // @ts-ignore
    <form action={props.formAction} className="max-w-2xl">
      <input type="hidden" name="id" value={props.entry?.id} />

      <TextAreaField
        id="body"
        label="Today"
        rows={15}
        defaultValue={props.entry?.body || ""}
        // onChange={(e) => setState({ ...state, body: e.target.value })}
      />
      <div className="float-right">
        <button type="submit" className="dark:text-white">
          Submit
        </button>
      </div>
    </form>
  );
}
