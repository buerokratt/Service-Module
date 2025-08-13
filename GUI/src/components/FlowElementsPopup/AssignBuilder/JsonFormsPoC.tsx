import React, { useState } from "react";
import { JsonForms } from "@jsonforms/react";
import { materialRenderers, materialCells } from "@jsonforms/material-renderers";

const JsonFormsPoC: React.FC = () => {
  const [data, setData] = useState({
    name: "John Doe",
    age: 30,
    email: "john@example.com",
    address: {
      street: "123 Main St",
      city: "Anytown",
      zip: "12345",
    },
    preferences: {
      theme: "dark",
      notifications: true,
    },
  });

  // Simple schema - defines the structure and validation
  const schema = {
    type: "object",
    properties: {
      name: {
        type: "string",
        title: "Full Name",
      },
      age: {
        type: "number",
        title: "Age",
        minimum: 0,
        maximum: 120,
      },
      email: {
        type: "string",
        title: "Email Address",
        format: "email",
      },
      address: {
        type: "object",
        title: "Address",
        properties: {
          street: { type: "string", title: "Street" },
          city: { type: "string", title: "City" },
          zip: { type: "string", title: "ZIP Code" },
        },
      },
      preferences: {
        type: "object",
        title: "Preferences",
        properties: {
          theme: {
            type: "string",
            title: "Theme",
            enum: ["light", "dark", "auto"],
          },
          notifications: {
            type: "boolean",
            title: "Enable Notifications",
          },
        },
      },
    },
  };

  // UI schema - controls the layout and presentation
  const uischema = {
    type: "Control",
    scope: "#",
    options: {
      showUnfocusedDescription: true,
    },
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h3>@jsonforms/react PoC</h3>
      <p>This shows the basic visual style and form generation capabilities.</p>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          backgroundColor: "#fafafa",
        }}
      >
        <JsonForms
          schema={schema}
          uischema={uischema}
          data={data}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ data, errors }) => {
            console.log("Data changed:", data);
            console.log("Validation errors:", errors);
            setData(data);
          }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>Current Data:</h4>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
            fontSize: "12px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default JsonFormsPoC;
