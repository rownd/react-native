import * as React from 'react';
import Svg, { SvgProps, Defs, Rect, Path, G, Use } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title, filter */

const SvgComponent = (props: SvgProps) => (
  <Svg
    width="79px"
    height="68px"
    viewBox="0 0 79 68"
    // @ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <Defs>
      <Rect
        id="path-1"
        x={9.69736842}
        y={6.17105263}
        width={53.7763158}
        height={45.8421053}
        rx={8}
      />
      <Path
        d="M1.49198314,22.8826009 L27.3602885,37.5009111 C33.5004408,40.9707422 41.014234,40.9500831 47.1352131,37.4465401 L72.5558685,22.8961951 C73.0351888,22.6218404 73.6461631,22.7879979 73.9205178,23.2673182 C74.007089,23.4185653 74.0526316,23.5898106 74.0526316,23.7640813 L74.0526316,63 C74.0526316,65.209139 72.2617706,67 70.0526316,67 L4,67 C1.790861,67 2.705415e-16,65.209139 0,63 L0,23.7532056 C8.43762138e-16,23.2009209 0.44771525,22.7532056 1,22.7532056 C1.17240673,22.7532056 1.34188502,22.7977797 1.49198314,22.8826009 Z"
        id="path-3"
      />
    </Defs>
    <G
      id="V2-post--feedback"
      stroke="none"
      strokeWidth={1}
      fill="none"
      fillRule="evenodd"
    >
      <G
        id="xlg-1312px-16-column-copy-96"
        transform="translate(-616.000000, -265.000000)"
      >
        <G id="Group" transform="translate(618.000000, 265.000000)">
          <Path
            d="M1.1333848,21.7417845 L33.0948714,2.49908682 C35.6464021,0.96291506 38.8400625,0.97130271 41.383489,2.52085558 L72.9358668,21.743773 C73.4075139,22.0311185 73.5569199,22.6464036 73.2695744,23.1180507 C73.2235298,23.1936281 73.1676563,23.2627588 73.1034181,23.3236315 L37.2457723,57.3026316 L37.2457723,57.3026316 L0.965647178,23.3284209 C0.562522036,22.9509179 0.54175124,22.3180937 0.919254307,21.9149685 C0.982302388,21.8476412 1.0543624,21.7893607 1.1333848,21.7417845 Z"
            id="Path-28"
            fill="#545454"
          />
          <G id="Rectangle">
            <Use
              fill="black"
              fillOpacity={1}
              // @ts-ignore
              filter="url(#filter-2)"
              xlinkHref="#path-1"
            />
            <Use fill="#FFFFFF" fillRule="evenodd" xlinkHref="#path-1" />
          </G>
          <Rect
            id="Rectangle"
            fillOpacity={0.4}
            fill="#D8D8D8"
            x={18.5131579}
            y={19.3947368}
            width={36.1447368}
            height={3.52631579}
          />
          <Rect
            id="Rectangle-Copy"
            fillOpacity={0.4}
            fill="#D8D8D8"
            x={18.5131579}
            y={27.3289474}
            width={36.1447368}
            height={26.4473684}
          />
          <G id="Rectangle">
            <Use
              fill="black"
              fillOpacity={1}
              // @ts-ignore
              filter="url(#filter-4)"
              xlinkHref="#path-3"
            />
            <Use fill="#646464" fillRule="evenodd" xlinkHref="#path-3" />
          </G>
          <Path
            d="M23.2845382,51.744338 L1.76315789,67 L1.76315789,67 L71.4078947,67 L49.8865144,51.744338 C41.9186006,46.0961966 31.252452,46.0961966 23.2845382,51.744338 Z"
            id="Path-29"
            fill="#545454"
          />
        </G>
      </G>
    </G>
  </Svg>
);

export default SvgComponent;
