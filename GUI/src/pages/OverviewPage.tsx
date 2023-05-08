import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Track } from "../components";
import { getServicesList } from "../resources/api-constants";
import ServicesTable from "../components/ServicesTable";
import { Service, ServiceState } from "../types";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";
import axios from "axios";

type ServicesResponse = {
  [key: string]: {
    readonly id: number;
    readonly state: ServiceState;
    readonly type: 'GET' | 'POST';
  }
};

const OverviewPage: React.FC = () => {
  const [serviceList, setServiceList] = useState<Service[]>([]);

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(getServicesList()).then(r => {
      const data: string[] = r.data.response;
      const list: ServicesResponse[] = data.map(d => JSON.parse(d));

      const services = list.map((value) => {
        const result = Object.entries(value).map(([key, value]) => {
          const service: Service = {
            id: value.id,
            name: key,
            usedCount: 0,
            state: value.state
          };
          return service;
        })
        return result;
      }).flatMap(item => item);

      setServiceList(services);
    })
  }, [setServiceList]);

  return (
    <>
      <Track justify="between">
        <h1>{t("overview.services")}</h1>
        <Button onClick={() => navigate(ROUTES.NEWSERVICE_ROUTE)} >{t("overview.create")}</Button>
      </Track>
      <ServicesTable dataSource={serviceList} />
    </>
  );
};

export default OverviewPage;
