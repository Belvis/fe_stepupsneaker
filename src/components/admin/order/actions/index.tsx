import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useTranslate, useUpdate } from "@refinedev/core";
import { Button, Space, Tooltip } from "antd";
import { IOrder } from "../../../../interfaces";
import { orderToPayload } from "../../../../utils/common/payloadConverter";

type OrderActionProps = {
  record: IOrder;
  callBack: any;
};

export const OrderActions: React.FC<OrderActionProps> = ({
  record,
  callBack,
}) => {
  const t = useTranslate();
  const { mutate, isLoading } = useUpdate();

  return (
    <Space size="middle">
      <Tooltip title={t("buttons.accept")}>
        <Button
          loading={isLoading}
          key="accept"
          style={{
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            fontWeight: 500,
          }}
          disabled={record.status !== "WAIT_FOR_CONFIRMATION"}
          icon={
            <CheckCircleOutlined
              style={{
                color: "#52c41a",
                fontSize: 17,
                fontWeight: 500,
              }}
            />
          }
          onClick={() => {
            const submitData = orderToPayload(record);
            mutate(
              {
                resource: "orders",
                id: submitData.id,
                values: {
                  ...submitData,
                  status: "WAIT_FOR_DELIVERY",
                },
              },
              {
                onError: (error, variables, context) => {
                  // An error occurred!
                },
                onSuccess: (data, variables, context) => {
                  callBack();
                },
              }
            );
          }}
        >
          {t("buttons.accept")}
        </Button>
      </Tooltip>

      <Tooltip title={t("buttons.reject")}>
        <Button
          loading={isLoading}
          key="reject"
          style={{
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            fontWeight: 500,
          }}
          icon={
            <CloseCircleOutlined
              style={{
                color: "#EE2A1E",
                fontSize: 17,
              }}
            />
          }
          disabled={
            record.status === "COMPLETED" || record.status === "CANCELED"
          }
          onClick={() => {
            const submitData = orderToPayload(record);
            mutate(
              {
                resource: "orders",
                id: submitData.id,
                values: {
                  ...submitData,
                  status: "CANCELED",
                },
              },
              {
                onError: (error, variables, context) => {
                  // An error occurred!
                },
                onSuccess: (data, variables, context) => {
                  callBack();
                },
              }
            );
          }}
        >
          {t("buttons.reject")}
        </Button>
      </Tooltip>
    </Space>
  );
};
