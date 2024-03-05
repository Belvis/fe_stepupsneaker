import { Grid, Modal, ModalProps } from "antd";
import { EditAddressForm } from "../form/edit";
import { IAddress } from "../../../../pages/interfaces";

type EditAddressProps = {
  modalProps: ModalProps;
  addressId: string;
  callBack: any;
};

export const EditAddress: React.FC<EditAddressProps> = ({
  modalProps,
  addressId,
  callBack,
}) => {
  const breakpoint = Grid.useBreakpoint();

  return (
    <Modal
      {...modalProps}
      open={modalProps.open}
      title={false}
      width={breakpoint.sm ? "500px" : "100%"}
      footer={false}
      zIndex={1002}
    >
      <EditAddressForm addressId={addressId} callBack={callBack} />
    </Modal>
  );
};
