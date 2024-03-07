import { useSimpleList } from "@refinedev/antd";
import { HttpError, useTranslate, useUpdate } from "@refinedev/core";
import { List as AntdList, Col, Grid, Modal, Row, message, theme } from "antd";
import { useContext, useEffect, useState } from "react";
import { ColorModeContext } from "../../../../contexts/color-mode";
import {
  ICustomer,
  IOrder,
  IVoucher,
  IVoucherFilterVariables,
} from "../../../../interfaces";
import Voucher from "./Voucher";

type DiscountModalProps = {
  open: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  customer: ICustomer | undefined;
  order: IOrder | undefined;
  callBack: any;
};

const { useToken } = theme;

export const DiscountModal: React.FC<DiscountModalProps> = ({
  open,
  handleOk,
  handleCancel,
  order,
  customer,
  callBack,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const { mutate: mutateUpdate, isLoading: isLoadingOrderUpdate } = useUpdate();
  const { mode } = useContext(ColorModeContext);
  const [messageApi, contextHolder] = message.useMessage();
  const breakpoint = Grid.useBreakpoint();

  useEffect(() => {
    if (open) refetch();
  }, [open]);

  const {
    listProps: voucherListProps,
    setFilters,
    queryResult: { refetch },
  } = useSimpleList<IVoucher, HttpError, IVoucherFilterVariables>({
    resource: "vouchers",
    filters: {
      initial: [
        {
          field: "status",
          operator: "eq",
          value: "ACTIVE",
        },
        // {
        //   field: "customer",
        //   operator: "eq",
        //   value: customer?.id,
        // },
      ],
    },
    pagination: {
      pageSize: 5,
    },
    syncWithLocation: false,
  });

  return (
    <Modal
      title={t("vouchers.vouchers")}
      width={breakpoint.sm ? "1000px" : "100%"}
      zIndex={1001}
      onCancel={handleCancel}
      open={open}
      confirmLoading={isLoadingOrderUpdate}
      footer={<></>}
    >
      {contextHolder}
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <AntdList
            {...voucherListProps}
            itemLayout="horizontal"
            bordered
            style={{ padding: "1rem" }}
            pagination={false}
            renderItem={(item) => {
              return (
                <AntdList.Item key={item.id}>
                  <Voucher
                    item={item}
                    order={order}
                    type="use"
                    callBack={callBack}
                    close={handleCancel}
                  />
                </AntdList.Item>
              );
            }}
          />
        </Col>
      </Row>
    </Modal>
  );
};
