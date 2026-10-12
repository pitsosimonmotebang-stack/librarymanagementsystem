import React from "react";

// A reusable text / number / password input with a label and an error message.
// The parent component controls the value, this one just shows it.
function FormField(props) {
  let errorMessage = null;
  if (props.error) {
    errorMessage = <span className="field-error">{props.error}</span>;
  }

  // A small grey note under the input (used to explain a locked field).
  let hintMessage = null;
  if (props.hint) {
    hintMessage = <span className="field-hint">{props.hint}</span>;
  }

  return (
    <div className="form-field">
      <label htmlFor={props.id}>{props.label}</label>
      <input
        id={props.id}
        name={props.id}
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        min={props.min}
        disabled={props.disabled}
      />
      {hintMessage}
      {errorMessage}
    </div>
  );
}

export default FormField;
