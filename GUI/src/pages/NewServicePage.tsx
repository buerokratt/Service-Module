import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Button, FormInput, Track } from "../components";
import { openApiSpeckMock } from "../resources/api-constants";
import toJsonSchema, {
  fromParameter,
} from "@openapi-contrib/openapi-schema-to-json-schema";
import Form from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { openApiToJsonSchema } from "openapi-json-schema";

const NewServicePage: React.FC = () => {
  const [openApiSpec, setOpenApiSpec] = useState("");
  const [jsonSchema, setJsonSchema] = useState<Record<string | number, any>>();

  const { t } = useTranslation();

  useEffect(() => {
    // fetchOpenApiSpecMock();
  }, []);

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
    const convertedSchema = openApiToJsonSchema(result.data.response);
    console.log(convertedSchema);
    setJsonSchema(convertedSchema);
    setOpenApiSpec(result.data.response);
  };

  return (
    <Track direction="vertical">
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
      ></link>
      <h1>{t("menu.newService")}</h1>
      <Track>
        <FormInput name={""} label={""}></FormInput>
        <Button>Ask For Spec</Button>
        <Button appearance="text" onClick={fetchOpenApiSpecMock}>
          Mock It
        </Button>
      </Track>
      {/* <Form schema={jsonSchema} validator={validator} /> */}
      {/* <span>{JSON.stringify(openApiSpec, null, 2)}</span> */}
      <span>{JSON.stringify(jsonSchema, null, 2)}</span>
    </Track>
  );
};

export default NewServicePage;
