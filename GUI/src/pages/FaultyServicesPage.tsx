import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, DataTable, Icon, Track } from '../components'
import { PaginationState, createColumnHelper } from '@tanstack/react-table';
import { MdOutlineRemoveRedEye } from 'react-icons/md';

interface FaultyService {
  id: string;
  service: string;
  elements: string;
  problems: number;
}

const FaultyServicesPage: React.FC = () => {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

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
      columnHelper.display({
        id: "view",
        meta: {
          size: 90,
        },
        cell: (_) => (
          <Track align="right" justify="start">
            <Button appearance="text">
              <Icon icon={<MdOutlineRemoveRedEye />} size="medium" />
              {t("logs.view")}
            </Button>
          </Track>
        ),
      }),
    ]
  }, []);

  const dummyData = useMemo(() => [
    { service: 'wewewe', elements: "dfdf", problems: 34 },
    { service: 'w', elements: "dfdf", problems: 34 },
    { service: 'w123ewewe', elements: "dfdf", problems: 34 },
    { service: 'wewe3rscf4we', elements: "dfdf", problems: 34 },
    { service: '---wewewe', elements: "dfdf", problems: 34 },
    { service: 'wewewe', elements: "dfdf", problems: 34 },
    { service: 'wewsdewe', elements: "dfdf", problems: 34 },
    { service: 'wewewsddse', elements: "dfdf", problems: 34 },
    { service: 'wewewe', elements: "dfdf", problems: 34 },
    { service: 'wew11111ewe', elements: "dfdf", problems: 34 },
    { service: 'we', elements: "dfdf", problems: 34 },
  ], []);

  return (
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
  )
}

export default FaultyServicesPage;
