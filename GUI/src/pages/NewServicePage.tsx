import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Button, FormInput, FormSelect, Track } from "../components";
import { openApiSpeckMock } from "../resources/api-constants";
import toJsonSchema, {
  fromParameter,
} from "@openapi-contrib/openapi-schema-to-json-schema";
import Form from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { openApiToJsonSchema } from "openapi-json-schema";
import { EndpointType } from "../types/endpointType";

const NewServicePage: React.FC = () => {
  const [openApiSpec, setOpenApiSpec] = useState("");
  const [jsonSchema, setJsonSchema] = useState<any>();
  const [endpoints, setEndpoints] = useState<EndpointType[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");

  const { t } = useTranslation();

  useEffect(() => {
    if (selectedEndpoint.length > 0) {
      const parameters = jsonSchema.paths[selectedEndpoint].post.parameters;
      if (parameters != undefined) {
        parameters.forEach((e: Record<string | number, any>) => {
          var convertedSchema = fromParameter(e);
          // console.log(convertedSchema);
        });
      }
      console.log(jsonSchema.paths[selectedEndpoint].post.parameters);
    }
  }, [selectedEndpoint]);

  const fetchOpenApiSpecMock = async () => {
    const result = await axios.post(openApiSpeckMock());
    console.log(result.data.response);
    // Dummy For Now
    // var param = {
    //   name: "name",
    //   in: "path",
    //   required: true,
    //   schema: {
    //     type: "string",
    //   },
    // };
    // var convertedSchema = fromParameter(param);
    const convertedSchema = toJsonSchema(result.data.response);
    const paths = Object.keys(convertedSchema.paths);
    const endpointsArr: EndpointType[] = [];
    paths.forEach((e) => {
      endpointsArr.push({
        label: `${e}`,
        value: `${e}`,
      });
    });
    setEndpoints(endpointsArr);
    setJsonSchema(convertedSchema);
    setOpenApiSpec(result.data.response);
  };

  return (
    <Track direction="vertical">
      <h1>{t("menu.newService")}</h1>
      <a style={{ marginBottom: "10px" }}></a>
      <Track>
        <FormInput name={""} label={""}></FormInput>
        <a style={{ marginLeft: "20px" }}></a>
        <Button>Ask For Spec</Button>
        <a style={{ marginLeft: "10px" }}></a>
        <Button appearance="text" onClick={fetchOpenApiSpecMock}>
          Mock It
        </Button>
      </Track>
      <a style={{ marginBottom: "20px" }}></a>
      {endpoints.length > 0 && (
        <FormSelect
          name={""}
          label={""}
          placeholder={"Select Endpoint"}
          options={endpoints}
          onSelectionChange={(value) => setSelectedEndpoint(value?.value ?? "")}
        />
      )}
    </Track>
  );
};

export default NewServicePage;
