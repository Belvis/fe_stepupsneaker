import { HttpError, useOne, useTranslate } from "@refinedev/core";
import { Form, FormProps, Grid, Input, Modal, ModalProps, Select } from "antd";
import { PRODUCT_STATUS_OPTIONS } from "../../../../constants";
import { IMaterial } from "../../../../interfaces";
import { showWarningConfirmDialog } from "../../../../utils";

type EditMaterialProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  id: any;
  onFinish: (values: any) => void;
};

export const EditMaterial: React.FC<EditMaterialProps> = ({
  modalProps,
  formProps,
  id,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { data } = useOne<IMaterial, HttpError>({
    resource: "materials",
    id,
  });

  const onFinishHandler = (values: any) => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(values);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
    >
      <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
        <Form.Item
          label={t("materials.fields.name")}
          name="name"
          initialValue={data?.data.name}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("materials.fields.status")}
          name="status"
          initialValue={data?.data.status}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select options={PRODUCT_STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
