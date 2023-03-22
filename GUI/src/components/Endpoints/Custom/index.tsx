import React from "react";
import { Button, FormInput, FormSelect, Track } from "../..";

const EndpointCustom: React.FC = () => {
  return (
    <Track direction="vertical" align="stretch" gap={16}>
      <div>
        <label htmlFor="name">API otspunkti URL</label>
        <Track gap={8}>
          <Track style={{ width: "100%" }}>
            <div style={{ width: 108 }}>
              <FormSelect
                name={"request-type"}
                label={""}
                style={{ borderRadius: "4px 0 0 4px", borderRight: 0 }}
                options={[
                  { label: "GET", value: "GET" },
                  { label: "POST", value: "POST" },
                ]}
                defaultValue="GET"
              />
            </div>
            <FormInput
              style={{ borderRadius: "0 4px 4px 0" }}
              name="name"
              label="Nimetus"
              hideLabel
              placeholder="Sisesta API otspunkt.."
            />
          </Track>
          <Button>Testi URLi</Button>
        </Track>
      </div>
    </Track>
  );
};

export default EndpointCustom;
