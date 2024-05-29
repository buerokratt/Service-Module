import { FC, useEffect, useMemo, useState } from "react";
import { createColumnHelper, PaginationState, SortingState } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { MdOutlineArrowForward } from "react-icons/md";
import useServiceStore from "store/services.store";
import { Button, DataTable, Dialog, FormInput, Icon, Modal, Track } from "components";
import { Intent } from "types/Intent";
import i18n from "i18n";

type ConnectServiceToIntentModelProps = {
  onModalClose: () => void;
  onConnect: (intent: Intent) => void;
};

const ConnectServiceToIntentModel: FC<ConnectServiceToIntentModelProps> = ({ onModalClose, onConnect }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [intents, setIntents] = useState<Intent[] | undefined>(undefined);
  const [selectedIntent, setSelectedIntent] = useState<Intent>();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const loadAvailableIntents = () => {
    useServiceStore
      .getState()
      .loadAvailableIntentsList(
        (requests: Intent[]) => setIntents(requests),
        t("overview.toast.failed.availableIntents")
      );
  };

  useEffect(() => {
    loadAvailableIntents();
  }, []);

  const intentColumns = useMemo(
    () =>
      getColumns((intent) => {
        setSelectedIntent(intent);
        setShowConfirmationModal(true);
      }),
    []
  );

  return (
    <Dialog title={t("overview.popup.connectServiceToIntent")} onClose={onModalClose} size="large">
      <Track
        direction="vertical"
        gap={8}
        style={{
          margin: "-16px -16px 0",
          padding: "16px",
          borderBottom: "1px solid #D2D3D8",
        }}
      >
        <FormInput
          label={t("overview.popup.searchIntents")}
          name="search"
          placeholder={t("overview.popup.searchIntents") + "..."}
          hideLabel
          onChange={(e) => setFilter(e.target.value)}
        />
      </Track>
      {!intents && (
        <Track justify="center" gap={16} direction="vertical">
          <div className="loader" style={{ marginTop: 10 }} />
        </Track>
      )}
      {intents && intents.length === 0 && (
        <Track justify="center" gap={16} direction="vertical">
          <label style={{ margin: 30 }}>{t("overview.popup.noIntentsAvailable")}</label>
        </Track>
      )}
      {intents && intents.length > 0 && (
        <DataTable
          data={intents}
          columns={intentColumns}
          globalFilter={filter}
          setGlobalFilter={setFilter}
          sortable
          sorting={sorting}
          pagination={pagination}
          setPagination={setPagination}
          setSorting={setSorting}
        />
      )}
      {showConfirmationModal && (
        <Modal title={t("overview.popup.connectionQuestion")} onClose={() => setShowConfirmationModal(false)}>
          <Track justify="end" gap={16}>
            <Button appearance="secondary" onClick={() => setShowConfirmationModal(false)}>
              {t("global.no")}
            </Button>
            <Button
              onClick={() => {
                if (selectedIntent) onConnect(selectedIntent);
              }}
            >
              {t("global.yes")}
            </Button>
          </Track>
        </Modal>
      )}
    </Dialog>
  );
};

const getColumns = (onClick: (intent: Intent) => void) => {
  const columnHelper = createColumnHelper<Intent>();

  return [
    columnHelper.accessor("intent", {
      header: i18n.t("overview.popup.intent") || "",
    }),
    columnHelper.display({
      id: "connect",
      cell: (props) => (
        <Button appearance="text" onClick={() => onClick(props.row.original)}>
          <Icon icon={<MdOutlineArrowForward color="rgba(0, 0, 0, 0.54)" />} />
          {i18n.t("overview.popup.connect")}
        </Button>
      ),
      meta: {
        size: "1%",
      },
    }),
  ];
};

export default ConnectServiceToIntentModel;
