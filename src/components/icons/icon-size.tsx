import Icon from "@ant-design/icons";

const SizeSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      fill="#000000"
      viewBox="0 0 32 32"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <title>alt-plus-frame</title>{" "}
        <path d="M0 26.016q0 2.496 1.76 4.224t4.256 1.76v-4q-0.832 0-1.44-0.576t-0.576-1.408h-4zM0 22.016h4v-4h-4v4zM0 14.016h4v-4h-4v4zM0 6.016h4q0-0.832 0.576-1.408t1.44-0.608v-4q-2.496 0-4.256 1.76t-1.76 4.256zM8 18.016h6.016v5.984h4v-5.984h5.984v-4h-5.984v-6.016h-4v6.016h-6.016v4zM10.016 28v4h4v-4h-4zM10.016 4h4v-4h-4v4zM18.016 28v4h4v-4h-4zM18.016 4h4v-4h-4v4zM26.016 28v4q2.464 0 4.224-1.76t1.76-4.224h-4q0 0.832-0.576 1.408t-1.408 0.576zM26.016 4q0.8 0 1.408 0.608t0.576 1.408h4q0-2.496-1.76-4.256t-4.224-1.76v4zM28 22.016h4v-4h-4v4zM28 14.016h4v-4h-4v4z"></path>{" "}
      </g>
    </svg>
  );
};

export const SizeIcon = (props: React.ComponentProps<typeof Icon>) => (
  <Icon component={SizeSVG} {...props} />
);
