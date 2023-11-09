import { HttpError, useOne, useTranslate } from "@refinedev/core";
import { Modal, ModalProps, Form, FormProps, Input, Select, Grid } from "antd";
import { IBrand } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";

type EditBrandProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  id: any;
  onFinish: (values: any) => void;
  close: () => void;
};

export const EditBrand: React.FC<EditBrandProps> = ({
  modalProps,
  formProps,
  id,
  onFinish,
  close,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { data, isLoading, isError } = useOne<IBrand, HttpError>({
    resource: "brands",
    id,
  });

  const onFinishHandler = (values: any) => {
    confirmDialog({
      message: t("confirmDialog.edit.message"),
      header: t("confirmDialog.edit.header"),
      icon: "pi pi-exclamation-triangle",
      acceptLabel: t("confirmDialog.edit.acceptLabel"),
      rejectLabel: t("confirmDialog.edit.rejectLabel"),
      acceptClassName: "p-button-warning",
      accept: () => {
        onFinish(values);
      },
      reject: () => {},
    });
  };

  return (
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
    >
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          isActive: true,
        }}
        onFinish={onFinishHandler}
      >
        <Form.Item
          label={t("brands.fields.name")}
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
          label={t("brands.fields.status")}
          name="status"
          initialValue={data?.data.status}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            options={[
              {
                label: "Active",
                value: "ACTIVE",
              },
              {
                label: "In Active",
                value: "IN_ACTIVE",
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
