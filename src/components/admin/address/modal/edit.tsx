import { Grid, Modal, ModalProps } from "antd";
import { EditAddressForm } from "../form/edit";
import { IAddress } from "../../../../interfaces";

type EditAddressProps = {
  modalProps: ModalProps;
  address: IAddress | undefined;
  callBack: any;
};

export const EditAddress: React.FC<EditAddressProps> = ({
  modalProps,
  address,
  callBack,
}) => {
  const breakpoint = Grid.useBreakpoint();

  return (
    <Modal
      {...modalProps}
      title={false}
      width={breakpoint.sm ? "500px" : "100%"}
      footer={false}
      zIndex={1002}
    >
      <EditAddressForm address={address} callBack={callBack}/>
    </Modal>
  );
};
