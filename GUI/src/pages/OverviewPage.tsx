import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Track } from "../components";
import { getServicesList, trainingModuleTraining } from "../resources/api-constants";
import ServicesTable from "../components/ServicesTable";
import { Service, ServiceState } from "../types";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";
import axios from "axios";

type ServicesResponse = {
  readonly id: number;
  readonly name: string;
  readonly state: ServiceState;
  readonly type: "GET" | "POST";
};

const OverviewPage: React.FC = () => {
  const [serviceList, setServiceList] = useState<Service[]>([]);

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    loadServicesList();
  }, []);

  const loadServicesList = async () => {
    const result = await axios.get<{ response: ServicesResponse[] }>(getServicesList());
    const services = result.data.response.map((item) => {
      return {
        id: item.id,
        name: item.name,
        state: item.state,
        type: item.type,
        usedCount: 0,
      } as Service;
    });
    setServiceList(services);
  };

  return (
    <>
      <Track justify="between">
        <h1>{t("overview.services")}</h1>
        <Button onClick={() => navigate(ROUTES.NEWSERVICE_ROUTE)}>{t("overview.create")}</Button>
      </Track>
      <ServicesTable dataSource={serviceList} onServiceUpadeCallback={loadServicesList} />
      <p>
        {t("overview.trainingModuleLink.text")}{" "}
        <a href={trainingModuleTraining()}>{t("overview.trainingModuleLink.train")}</a>.
      </p>
    </>
  );
};

export default OverviewPage;
