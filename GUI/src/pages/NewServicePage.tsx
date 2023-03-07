import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Track } from "../components";
import { openApiSpeckMock } from "../resources/api-constants";

const NewServicePage: React.FC = () => {
  const [openApiSpec, setOpenApiSpec] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    fetchOpenApiSpecMock();
  }, []);

  const fetchOpenApiSpecMock = async () => {
    const result = await axios.post(openApiSpeckMock());
    console.log(result.data.response);
    setOpenApiSpec(result.data.response);
  };

  return (
    <Track direction="vertical">
      <h1>{t("menu.newService")}</h1>
      <span>{JSON.stringify(openApiSpec, null, 2)}</span>
    </Track>
  );
};

export default NewServicePage;
