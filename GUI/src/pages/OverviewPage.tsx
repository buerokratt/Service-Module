import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Track } from "../components";
import { dummyServiceData, getServicesList } from "../resources/api-constants";
import ServicesTable from "../components/ServicesTable";
import { Service } from "../types";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";
import axios from "axios";

const OverviewPage: React.FC = () => {
  const [dummyData, setDummyData] = useState<Service[]>([]);

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const services: Service[] = [];
    axios.get(getServicesList()).then((r) => {
      console.log(JSON.parse(r.data.response.value));
      Object.values(JSON.parse(r.data.response.value)).forEach((value: any) => {
        Object.entries(value).forEach(([key, value]) => {
          const service: Service = {
            id: (value as any).id,
            type: (value as any).type,
            name: key,
            usedCount: 0,
            state: (value as any).state,
          };
          services.push(service);
        });
      });
      setDummyData(services);
    });
  }, []);

  return (
    <>
      <Track justify="between">
        <h1>{t("overview.services")}</h1>
        <Button onClick={() => navigate(ROUTES.NEWSERVICE_ROUTE)}>{t("overview.create")}</Button>
      </Track>
      <ServicesTable dataSource={dummyData} />
    </>
  );
};

export default OverviewPage;
