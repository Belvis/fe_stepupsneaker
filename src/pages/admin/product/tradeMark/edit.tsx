import { HttpError, useOne, useTranslate } from "@refinedev/core";
import { Form, FormProps, Grid, Input, Modal, ModalProps, Select } from "antd";
import { PRODUCT_STATUS_OPTIONS } from "../../../../constants";
import { ITradeMark } from "../../../../interfaces";
import { showWarningConfirmDialog } from "../../../../utils";
import { validateCommon } from "../../../../helpers/validate";

type EditTradeMarkProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  id: any;
  onFinish: (values: any) => void;
};

export const EditTradeMark: React.FC<EditTradeMarkProps> = ({
  modalProps,
  formProps,
  id,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { data } = useOne<ITradeMark, HttpError>({
    resource: "tradeMarks",
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
          label={t("tradeMarks.fields.name")}
          name="name"
          initialValue={data?.data.name}
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "name"),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("tradeMarks.fields.status")}
          name="status"
          initialValue={data?.data.status}
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "status"),
            },
          ]}
        >
          <Select options={PRODUCT_STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
