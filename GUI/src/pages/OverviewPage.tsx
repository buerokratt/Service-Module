import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Track } from "../components";
import { dummyServiceData } from "../resources/api-constants";
import ServicesTable from "../components/ServicesTable";
import { Service } from "../types/service";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";

const OverviewPage: React.FC = () => {
  const [dummyData, setDummyData] = useState<Service[]>([]);

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    setDummyData(dummyServiceData);
  }, []);

  return (
    <>
      <Track justify="between">
        <h1>{t("overview.services")}</h1>
        <Button onClick={() => navigate(ROUTES.NEWSERVICE_ROUTE)} >{t("overview.create")}</Button>
      </Track>
      <ServicesTable dataSource={dummyData} />
    </>
  );
};

export default OverviewPage;
