import { List as AntdList, Modal } from "antd";
import React, { ReactNode } from "react";
import { IOrder, IVoucherList } from "../../../../interfaces";
import Voucher from "./Voucher";

interface VoucherModalProps {
  restModalProps: {
    open?: boolean | undefined;
    confirmLoading?: boolean | undefined;
    title?: ReactNode;
    closable?: boolean | undefined;
  };
  close: () => void;
  vouchers: IVoucherList[];
  type?: "apply" | "copy";
  setViewOrder?: React.Dispatch<React.SetStateAction<IOrder>>;
}

const VoucherModal: React.FC<VoucherModalProps> = ({
  restModalProps,
  vouchers,
  type,
  setViewOrder,
  close,
}) => {
  function renderItem(item: IVoucherList) {
    return (
      <AntdList.Item actions={[]}>
        <AntdList.Item.Meta title={""} description={""} />
        <Voucher
          item={item.voucher}
          type={type}
          setViewOrder={setViewOrder}
          close={close}
        />
      </AntdList.Item>
    );
  }
  return (
    <Modal
      title="Danh sách phiếu giảm giá còn hoạt động"
      {...restModalProps}
      open={restModalProps.open}
      width="700px"
      centered
      footer={<></>}
    >
      <AntdList
        itemLayout="horizontal"
        dataSource={vouchers}
        renderItem={renderItem}
      />
    </Modal>
  );
};

export default VoucherModal;
