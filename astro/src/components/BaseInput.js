"use strict";

export function border(error, borderless, focusWithin, additionalClasses) {
  let borderValue = borderless ? ["border border-transparent ring-1 ring-transparent relative rounded shadow-sm w-full focus:outline-none"] :
      ["border border-slate-300 ring-1 ring-transparent relative rounded shadow-sm w-full focus:outline-none dark:border-slate-500"];
  if (error) {
    borderValue.push("border-red-500");

    if (focusWithin) {
      borderValue.push("focus-within:border focus-within:border-red-500 focus-within:ring-red-500");
    } else {
      borderValue.push("focus:border focus:border-red-500 focus:ring-red-500");
    }
  } else {
    if (focusWithin) {
      borderValue.push("focus-within:border focus-within:border-indigo-500 focus-within:ring-indigo-500");
    } else {
      borderValue.push("focus:border focus:border-indigo-500 focus:ring-indigo-500");
    }
  }

  if (additionalClasses) {
    borderValue.push(additionalClasses);
  }

  return borderValue;
}
