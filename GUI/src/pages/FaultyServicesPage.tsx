import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, DataTable, Icon, Track } from '../components'
import { PaginationState, createColumnHelper } from '@tanstack/react-table';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import Popup from '../components/Popup';
import axios from 'axios';
import { getFaultyServices } from '../resources/api-constants';

interface FaultyService {
  id: string;
  service: string;
  elements: string[];
  problems: number;
  environment: string;
  content: string[];
}

const FaultyServicesPage: React.FC = () => {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [viewFaultyServiceLog, setViewFaultyServiceLog] = useState<FaultyService | null>(null);
  const [data, setData] = useState<FaultyService[]>([]);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<FaultyService>();

    return [
      columnHelper.accessor("service", {
        header: t("logs.service") ?? "",
      }),
      columnHelper.accessor("elements", {
        header: t("logs.elements") ?? "",
        meta: {
          size: 600,
        },
      }),
      columnHelper.accessor("problems", {
        header: t("logs.problems") ?? "",
      }),
      columnHelper.accessor("environment", {
        header: t("logs.environment") ?? "",
      }),
      columnHelper.display({
        id: "view",
        meta: {
          size: 90,
        },
        cell: (props) => (
          <Track align="right" justify="start">
            <Button appearance="text" onClick={() => setViewFaultyServiceLog(props.row.original)}>
              <Icon icon={<MdOutlineRemoveRedEye />} size="medium" />
              {t("logs.view")}
            </Button>
          </Track>
        ),
      }),
    ]
  }, []);

  useEffect(() => {
    axios.get(getFaultyServices())
      .then((res) => setData(res.data))
  }, []);

  return (
    <>
      {viewFaultyServiceLog && (
        <Popup
          title={`${t("logs.log")}: ${viewFaultyServiceLog.service}`}
          onClose={() => setViewFaultyServiceLog(null)}
          footer={
            <Button
              appearance="secondary"
              onClick={() => setViewFaultyServiceLog(null)}
            >
              {t("global.close")}
            </Button>
          }
        >
          <Track
            direction='vertical'
            align='left'
            style={{
              padding: '1rem',
              background: '#f0f0f2',
              borderRadius: '.2rem',
              color: '#4e4f5d',
            }}
          >
            {viewFaultyServiceLog.content?.map((x: string) => <span key={x}>{x}</span>)}
          </Track>
        </Popup>
      )}

      <Track direction='vertical' align='stretch'>
        <h1>{t('menu.faultyServices')}</h1>
        <Card>
          <DataTable
            sortable
            filterable
            pagination={pagination}
            setPagination={setPagination}
            data={data}
            columns={columns}
          />
        </Card>
      </Track>
    </>
  )
}

export default FaultyServicesPage;
