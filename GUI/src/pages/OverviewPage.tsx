import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Track } from "../components";
import { dummyServiceData } from "../resources/api-constants";
import ServicesTable from "../components/ServicesTable";
import { Service } from "../types/service";

const OverviewPage: React.FC = () => {
  const [dummyData, setDummyData] = useState<Service[]>([]);

  const { t } = useTranslation();

  useEffect(() => {
    setDummyData(dummyServiceData);
  }, []);

  return (
    <>
      <Track justify="between">
        <h1>{t("overview.services")}</h1>
        <Button>{t("overview.create")}</Button>
      </Track>
      <ServicesTable dataSource={dummyData} />
    </>
  );
};

export default OverviewPage;
