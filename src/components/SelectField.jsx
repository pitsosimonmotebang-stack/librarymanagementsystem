import React from "react";

// A reusable dropdown. props.options is a list of { value, label } objects.
function SelectField(props) {
  const optionElements = [];

  for (let i = 0; i < props.options.length; i = i + 1) {
    const option = props.options[i];
    optionElements.push(
      <option key={option.value + "-" + i} value={option.value}>
        {option.label}
      </option>
    );
  }

  let errorMessage = null;
  if (props.error) {
    errorMessage = <span className="field-error">{props.error}</span>;
  }

  return (
    <div className="form-field">
      <label htmlFor={props.id}>{props.label}</label>
      <select id={props.id} name={props.id} value={props.value} onChange={props.onChange}>
        {optionElements}
      </select>
      {errorMessage}
    </div>
  );
}

export default SelectField;
