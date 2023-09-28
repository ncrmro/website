"use client";
import React from "react";

export default function ClientTimezoneInput() {
  return (
    <input
      type="hidden"
      name="timezone"
      value={Intl.DateTimeFormat().resolvedOptions().timeZone}
    />
  );
}
