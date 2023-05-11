import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, DataTable, Icon, Track } from '../components'
import { PaginationState, createColumnHelper } from '@tanstack/react-table';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import Popup from '../components/Popup';

interface FaultyService {
  id: string;
  service: string;
  elements: string;
  problems: number;
  environment: string;
  logs: string[];
}

const FaultyServicesPage: React.FC = () => {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [viewFaultyServiceLog, setViewFaultyServiceLog] = useState<FaultyService | null>(null)

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

  const dummyData = useMemo(() => [
    { service: 'wewewe', elements: "dfdf", problems: 34, environment: 'test' },
    { service: 'w', elements: "dfdf", problems: 34, environment: 'production' },
    {
      service: 'w123ewewe', elements: "dfdf", problems: 34, logs: [
        '2022-06-21 12:29:17.742+03:00 INFO [9ec5153c8585c6df,9ec5153c8585c6df]',
        '2022-06-21 12:29:18.027+03:00 INFO [9ec5153c8585c6df,03f0c4392719216]',
        '2022-06-21 12:29:18.030+03:00 INFO [9ec5153c8585c6df,57225a41b2cdfle]']
    },
    { service: 'wewe3rscf4we', elements: "dfdf", problems: 34 },
    { service: '---wewewe', elements: "dfdf", problems: 34, environment: 'test' },
    { service: 'wewewe', elements: "dfdf", problems: 34, environment: 'test' },
    { service: 'wewsdewe', elements: "dfdf", problems: 34 },
    { service: 'wewewsddse', elements: "dfdf", problems: 34 },
    { service: 'wewewe', elements: "dfdf", problems: 34, environment: 'test' },
    { service: 'wew11111ewe', elements: "dfdf", problems: 34 },
    { service: 'we', elements: "dfdf", problems: 34 },
  ], []);

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
            {viewFaultyServiceLog.logs?.map((x: string) => <span key={x}>{x}</span>)}
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
            data={dummyData}
            columns={columns}
          />
        </Card>
      </Track>
    </>
  )
}

export default FaultyServicesPage;
