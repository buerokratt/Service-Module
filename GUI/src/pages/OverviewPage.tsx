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
  readonly iscommon: boolean;
};

const OverviewPage: React.FC = () => {
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [commonServiceList, setCommonServiceList] = useState<Service[]>([]);

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    loadServicesList();
  }, []);

  const loadServicesList = async () => {
    const result = await axios.get<{ response: ServicesResponse[] }>(getServicesList());
    console.log(result.data.response);
    const services = result.data.response.map((item) => {
      return {
        id: item.id,
        name: item.name,
        state: item.state,
        type: item.type,
        usedCount: 0,
        isCommon: item.iscommon,
      } as Service;
    });
    setServiceList(services.filter((e) => e.isCommon === false));
    setCommonServiceList(services.filter((e) => e.isCommon === true));
  };

  return (
    <>
      <Track justify="between">
        <h1>{t("overview.services")}</h1>
        <Button onClick={() => navigate(ROUTES.NEWSERVICE_ROUTE)}>{t("overview.create")}</Button>
      </Track>
      <ServicesTable dataSource={serviceList} onServiceUpadeCallback={loadServicesList} isCommon={false} />
      <Track justify="between">
        <h1>{t("overview.commonServices")}</h1>
      </Track>
      <ServicesTable dataSource={commonServiceList} onServiceUpadeCallback={loadServicesList} isCommon={true} />
      <p>
        {t("overview.trainingModuleLink.text")}{" "}
        <a href={trainingModuleTraining()}>{t("overview.trainingModuleLink.train")}</a>.
      </p>
    </>
  );
};

export default OverviewPage;
