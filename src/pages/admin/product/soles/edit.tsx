import { HttpError, useOne, useTranslate } from "@refinedev/core";
import { Form, FormProps, Grid, Input, Modal, ModalProps, Select } from "antd";
import { ISole } from "../../../../interfaces";
import { showWarningConfirmDialog } from "../../../../utils";
import { validateCommon } from "../../../../helpers/validate";
import { getProductStatusOptions } from "../../../../constants";

type EditSoleProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  id: any;
  onFinish: (values: any) => void;
};

export const EditSole: React.FC<EditSoleProps> = ({
  modalProps,
  formProps,
  id,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { data } = useOne<ISole, HttpError>({
    resource: "soles",
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
          label={
            <div>
              <span>{t("soles.fields.name")}</span>
              <span className="sub-label">(Tối đa 255 ký tự)</span>
            </div>
          }
          required
          name="name"
          initialValue={data?.data.name}
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "name"),
            },
          ]}
        >
          <Input maxLength={255} showCount />
        </Form.Item>
        <Form.Item
          label={t("soles.fields.status")}
          name="status"
          required
          initialValue={data?.data.status}
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "status"),
            },
          ]}
        >
          <Select options={getProductStatusOptions(t)} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
