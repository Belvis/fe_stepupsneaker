import Icon from "@ant-design/icons";

const OverviewSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      viewBox="0 0 1024 1024"
      className="icon"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="#000000"
      {...props}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M713.664 832H310.208L182.4 959.936 128 905.6 201.6 832H64V64h896v768h-137.664l73.6 73.6-54.336 54.336L713.664 832zM140.8 140.8v614.4h742.4V140.8H140.8zM281.6 256h76.8v384H281.6V256z m384 192h76.8v192h-76.8V448z m-192-96h76.8V640H473.6V352z"
          fill="#000000"
        ></path>
      </g>
    </svg>
  );
};

export const OverviewIcon = (props: React.ComponentProps<typeof Icon>) => (
  <Icon component={OverviewSVG} {...props} />
);
